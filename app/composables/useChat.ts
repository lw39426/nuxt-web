import { computed, onMounted, onUnmounted, reactive, ref, shallowRef, watch } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '~/stores/auth'
import type {
  ChatConnectedEvent,
  ChatIdentity,
  ChatMessage,
  ChatPage,
  ChatRoom
} from '~/types/chat'
import { getChatIdentity } from '~/utils/chat'

/** 连接状态：正在握手、已确认、已断开，供界面区分展示。 */
export type ChatConnectionState = 'connecting' | 'connected' | 'disconnected'

/** Socket 发送回执，仅通过 temp_id 关联本地待确认消息。 */
interface ChatAckEvent {
  temp_id?: unknown
  success?: unknown
  message_id?: unknown
  timestamp?: unknown
  error?: unknown
}

/** 从未知错误中提取可读信息，避免界面直接展示 undefined。 */
function messageOf(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message.trim()
  }
  return '聊天请求失败'
}

/** 判断是否为非空非数组的对象，作为后端结构的基本校验。 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 仅接受正安全整数作为真实聊天资源 ID，拒绝展示占位与伪造值。 */
function isValidId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

/** 安全解析消息时间，缺失或无效时间按 0 参与排序。 */
function messageTime(message: ChatMessage): number {
  const time = Date.parse(message.created_at ?? '')
  return Number.isFinite(time) ? time : 0
}

/** 以房间与永久消息 ID 组成稳定键，保证同一消息只保留一条。 */
function messageKey(message: ChatMessage): string {
  const room = typeof message.room_id === 'number' ? message.room_id : 0
  return `${room}:${message.id}`
}

/** 校验并投影后端会话，缺少有效 ID 的记录视为无效而不进入列表。 */
function normalizeRoom(value: unknown): ChatRoom | null {
  if (!isObject(value) || !isValidId(value.id)) return null
  const room: ChatRoom = { id: value.id }
  if (typeof value.type === 'string') room.type = value.type
  if (typeof value.name === 'string') room.name = value.name
  // 保留原始成员数组，非法元素交由工具函数判定为成员集合未知。
  if (Array.isArray(value.participants))
    room.participants = value.participants as ChatRoom['participants']
  if (typeof value.participant_count === 'number') room.participant_count = value.participant_count
  if (typeof value.unread_count === 'number') room.unread_count = value.unread_count
  if (value.last_message === null) room.last_message = null
  else if (isObject(value.last_message)) {
    room.last_message = value.last_message as ChatRoom['last_message']
  }
  return room
}

/** 校验并投影后端消息，永久 ID 缺失或不合法时拒绝该条记录。 */
function normalizeMessage(value: unknown, fallbackRoom?: number): ChatMessage | null {
  if (!isObject(value)) return null
  const id = value.message_id ?? value.id
  if (!isValidId(id)) return null
  const message: ChatMessage = { id }
  if (isValidId(value.room_id)) message.room_id = value.room_id
  else if (isValidId(fallbackRoom)) message.room_id = fallbackRoom
  if (typeof value.content === 'string') message.content = value.content
  if (typeof value.created_at === 'string') message.created_at = value.created_at
  // sender 为 null 或非对象时保持未知，不用空对象伪装成真实发送者。
  if (isObject(value.sender)) message.sender = value.sender as ChatMessage['sender']
  if (typeof value.is_own === 'boolean') message.is_own = value.is_own
  return message
}

/** 管理真实聊天的会话、历史消息及 Socket 确认和重连状态。 */
export function useChat() {
  const api = useApi()
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  const rooms = ref<ChatRoom[]>([])
  const active = ref<number | null>(null)
  const messages = ref<ChatMessage[]>([])
  const connectionState = ref<ChatConnectionState>('disconnected')
  /** 兼容既有界面：仅连接已确认时为真。 */
  const connected = computed(() => connectionState.value === 'connected')
  const identity = ref<ChatIdentity | null>(null)
  const error = ref('')
  const roomsError = ref('')
  const historyError = ref('')
  /** 明确布尔值表示后端结论，null 表示分页信息缺失或请求尚未成功。 */
  const hasRooms = ref<boolean | null>(null)
  const hasHistory = ref<boolean | null>(null)
  const loading = ref(false)
  const roomsLoading = shallowRef(false)
  const pending = reactive<Record<string, { room: number; text: string; status: string }>>({})

  /** 账号会话代次：注销或切换账号时递增，使旧账号的在途请求全部失效。 */
  let sessionEpoch = 0
  /** 选房代次：切换会话或重连恢复时递增，防止旧房间响应写回新房间。 */
  let roomEpoch = 0
  /** 组件卸载标记，阻止延迟回调继续操作视图。 */
  let disposed = false

  let roomRequests = 0
  let historyRequests = 0
  let roomPage = 0
  let historyPage = 0
  let heartbeat: ReturnType<typeof setInterval> | undefined
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  let refreshing = false

  const socket: Socket = io(config.public.chatSocketOrigin || undefined, {
    autoConnect: false,
    auth: (callback) => callback({ token: auth.token }),
    path: '/socket.io'
  })

  /** 当前选中会话的真实房间对象，缺失或列表未加载时返回 null。 */
  const activeRoom = computed<ChatRoom | null>(() => {
    const id = active.value
    if (!isValidId(id)) return null
    return rooms.value.find((room) => room.id === id) ?? null
  })

  /** 记录聊天操作错误，供顶部提示统一展示；卸载后不再写入。 */
  function report(e: unknown) {
    if (disposed) return
    error.value = messageOf(e)
  }

  /** 字段级合并：新记录的非空字段补充旧记录，绝不擦除已有真实字段。 */
  function mergeFields(previous: ChatMessage, next: ChatMessage): ChatMessage {
    const merged = { ...previous }
    if (next.room_id != null) merged.room_id = next.room_id
    if (next.content != null) merged.content = next.content
    if (next.created_at != null) merged.created_at = next.created_at
    if (next.sender != null) merged.sender = next.sender
    if (next.is_own != null) merged.is_own = next.is_own
    return merged
  }

  /** 按房间与永久 ID 去重合并，并使用真实时间升序排列。 */
  function merge(items: ChatMessage[]) {
    if (!items.length) return
    const map = new Map<string, ChatMessage>()
    for (const item of messages.value) map.set(messageKey(item), item)
    for (const item of items) {
      const key = messageKey(item)
      const existing = map.get(key)
      map.set(key, existing ? mergeFields(existing, item) : item)
    }
    messages.value = [...map.values()].sort(
      (a, b) => messageTime(a) - messageTime(b) || a.id - b.id
    )
  }

  /** 清除单个待确认消息的超时计时，避免结果确认后又被改写。 */
  function clearTimer(temp: string) {
    const timer = timers.get(temp)
    if (timer !== undefined) {
      clearTimeout(timer)
      timers.delete(temp)
    }
  }

  /** 清除全部待确认计时，用于会话重置与卸载。 */
  function clearAllTimers() {
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
  }

  /** 清空待确认消息及其计时，不猜测发送结果。 */
  function clearPending() {
    clearAllTimers()
    Object.keys(pending).forEach((key) => Reflect.deleteProperty(pending, key))
  }

  /** 停止心跳定时，重连或卸载时调用。 */
  function stopHeartbeat() {
    if (heartbeat !== undefined) {
      clearInterval(heartbeat)
      heartbeat = undefined
    }
  }

  /** 启动心跳，仅在实际已连接时发送 ping。 */
  function startHeartbeat() {
    stopHeartbeat()
    heartbeat = setInterval(() => {
      if (socket.connected) socket.emit('ping', { ping_id: Date.now() })
    }, 30000)
  }

  /** 递增会话代次并清空全部真实状态，用于注销或账号切换。 */
  function resetSession() {
    sessionEpoch += 1
    roomEpoch += 1
    rooms.value = []
    active.value = null
    messages.value = []
    identity.value = null
    hasRooms.value = null
    hasHistory.value = null
    historyPage = 0
    roomPage = 0
    error.value = ''
    roomsError.value = ''
    historyError.value = ''
    clearPending()
    stopHeartbeat()
  }

  /** 生成聊天请求作用域，使不同账号会话不共用同一并发锁。 */
  function requestScope(): string {
    const id = auth.user?.id
    if (isValidId(id)) return `chat:user:${id}`
    return typeof auth.refreshToken === 'string' && auth.refreshToken
      ? `chat:refresh:${auth.refreshToken}`
      : 'chat:anonymous'
  }

  /** 加载会话列表；分页字段缺失时保留未知状态，不误判为没有更多。 */
  async function loadRooms(more = false) {
    const epoch = sessionEpoch
    const page = more ? roomPage + 1 : 1
    roomRequests += 1
    roomsLoading.value = true
    try {
      const data = await api.get<ChatPage<ChatRoom>>(
        '/chat/rooms',
        { page, per_page: 20 },
        {
          scope: requestScope()
        }
      )
      if (disposed || epoch !== sessionEpoch) return
      if (!isObject(data) || !Array.isArray(data.rooms)) {
        throw new Error('会话列表响应格式错误')
      }
      const valid = data.rooms
        .map((item) => normalizeRoom(item))
        .filter((item): item is ChatRoom => item !== null)
      rooms.value = more
        ? [...new Map([...rooms.value, ...valid].map((room) => [room.id, room])).values()]
        : valid
      roomPage = page
      const next = data.pagination?.has_next
      hasRooms.value = typeof next === 'boolean' ? next : null
      roomsError.value = ''
    } catch (e) {
      if (epoch === sessionEpoch) roomsError.value = messageOf(e)
      throw e
    } finally {
      roomRequests -= 1
      if (roomRequests <= 0) roomsLoading.value = false
    }
  }

  /** 主动发起 Socket 握手，重复调用不产生额外连接。 */
  function connectSocket() {
    if (socket.connected) return
    if (connectionState.value !== 'connected') connectionState.value = 'connecting'
    socket.connect()
  }

  /** 重连按钮：先发起 Socket 握手，再真实刷新列表，REST 失败不阻断连接。 */
  async function reconnect(): Promise<void> {
    error.value = ''
    connectSocket()
    try {
      await loadRooms()
    } catch (e) {
      report(e)
    }
  }

  /**
   * 加载历史消息并返回该页永久 ID；请求过期、房间变化或格式错误时返回 null。
   * 不将缺失分页当作没有更多，也不自动重发失败请求。
   */
  async function history(more = false): Promise<{ ids: number[] } | null> {
    const room = active.value
    if (!isValidId(room)) return null
    const epoch = sessionEpoch
    const version = roomEpoch
    const page = more ? historyPage + 1 : 1
    historyRequests += 1
    loading.value = true
    historyError.value = ''
    try {
      const data = await api.get<ChatPage<ChatMessage>>(
        `/chat/rooms/${room}/messages`,
        { page, per_page: 20 },
        { scope: requestScope() }
      )
      if (disposed || epoch !== sessionEpoch || version !== roomEpoch || active.value !== room) {
        return null
      }
      if (!isObject(data) || !Array.isArray(data.messages)) {
        throw new Error('历史消息响应格式错误')
      }
      const valid = data.messages
        .map((item) => normalizeMessage(item, room))
        .filter((item): item is ChatMessage => item !== null)
      merge(valid)
      historyPage = page
      const next = data.pagination?.has_next
      hasHistory.value = typeof next === 'boolean' ? next : null
      return { ids: valid.map((item) => item.id) }
    } catch (e) {
      if (epoch === sessionEpoch && version === roomEpoch && active.value === room) {
        historyError.value = messageOf(e)
      }
      throw e
    } finally {
      historyRequests -= 1
      if (historyRequests <= 0 && epoch === sessionEpoch) loading.value = false
    }
  }

  /** 重连恢复：刷新当前会话，并按与恢复前消息快照的重叠判断补齐离线缺口。 */
  async function recoverHistory(epoch: number, room: number) {
    const known = new Set(messages.value.map((item) => item.id))
    const first = await history(false)
    if (first === null || epoch !== sessionEpoch || active.value !== room) return
    if (first.ids.some((id) => known.has(id))) return

    let guard = 0
    while (
      hasHistory.value === true &&
      epoch === sessionEpoch &&
      active.value === room &&
      guard < 100
    ) {
      guard += 1
      const page = await history(true)
      if (page === null) return
      if (page.ids.some((id) => known.has(id))) return
    }
  }

  /** 上报当前会话已读并刷新列表；仅在页面可见且会话未过期时执行。 */
  async function read() {
    const room = active.value
    if (!import.meta.client || !isValidId(room) || document.hidden) return
    const epoch = sessionEpoch
    await api.post(`/chat/rooms/${room}/read`, undefined, { scope: requestScope() })
    if (epoch !== sessionEpoch) return
    await loadRooms()
  }

  /** 切换会话：离开旧房间、加入新房间并加载真实历史。 */
  async function select(room: number) {
    if (!isValidId(room)) throw new Error('请输入有效会话 ID')
    roomEpoch += 1
    if (isValidId(active.value) && socket.connected) {
      socket.emit('leave_room', { room_id: active.value })
    }
    active.value = room
    messages.value = []
    historyPage = 0
    hasHistory.value = null
    historyError.value = ''
    if (socket.connected) socket.emit('join_room', { room_id: room })
    await history()
  }

  /** 通过用户 ID 创建私聊；列表刷新失败仍进入后端已确认的真实会话。 */
  async function openPrivate(id: number) {
    if (!isValidId(id)) throw new Error('请输入有效用户 ID')
    const data = await api.post<{ room_id?: unknown }>(
      '/chat/rooms',
      {
        type: 'private',
        participants: [{ user_id: id, user_type: 'NormalUser' }]
      },
      { scope: requestScope() }
    )
    if (!isObject(data) || !isValidId(data.room_id)) {
      throw new Error('创建私聊响应缺少有效会话 ID')
    }
    try {
      await loadRooms()
    } catch (e) {
      report(e)
    }
    await select(data.room_id)
  }

  /** 发送消息并保留待确认状态；超时只标记结果未知，不自动重发。 */
  function send(text: string) {
    const room = active.value
    const content = text.trim()
    if (connectionState.value !== 'connected' || !isValidId(room) || !content) return false
    if (!getChatIdentity(identity.value)) return false
    const temp = crypto.randomUUID()
    pending[temp] = { room, text: content, status: '发送中' }
    socket.emit('send_message', { room_id: room, content, type: 'text', temp_id: temp })
    const timer = setTimeout(() => {
      timers.delete(temp)
      const item = pending[temp]
      if (!item) return
      item.status = '发送结果待确认，请查看最新消息，避免重复发送'
      if (active.value === item.room && connectionState.value === 'connected') {
        void history().catch(report)
      }
    }, 15000)
    timers.set(temp, timer)
    return true
  }

  /** 处理发送回执：成功合并真实消息，失败保留原因并取消超时改写。 */
  function onAckEvent(ack?: ChatAckEvent) {
    if (disposed || !isObject(ack) || typeof ack.temp_id !== 'string') return
    const item = pending[ack.temp_id]
    if (!item) return
    clearTimer(ack.temp_id)

    if (ack.success === true) {
      if (isValidId(ack.message_id) && active.value === item.room) {
        merge([
          {
            id: ack.message_id,
            room_id: item.room,
            content: item.text,
            created_at: typeof ack.timestamp === 'string' ? ack.timestamp : undefined,
            sender: null,
            is_own: true
          }
        ])
      }
      Reflect.deleteProperty(pending, ack.temp_id)
      return
    }
    if (ack.success === false) {
      const reason = typeof ack.error === 'string' ? ack.error.trim() : ''
      item.status = reason || '发送失败'
    }
  }

  /** 接收新消息：当前会话即时展示，其他会话只刷新列表。 */
  function onNewMessageEvent(raw?: unknown) {
    if (disposed) return
    const message = normalizeMessage(raw, isValidId(active.value) ? active.value : undefined)
    if (!message) return
    if (message.room_id === active.value) merge([message])
    void loadRooms().catch(report)
  }

  /** Socket 建连：确认真实身份，恢复会话与历史并维持心跳。 */
  async function onConnectedEvent(event?: ChatConnectedEvent) {
    if (disposed) return
    connectionState.value = 'connected'
    error.value = ''
    const nextIdentity = getChatIdentity({ id: event?.user_id, type: event?.user_type })
    if (nextIdentity) {
      identity.value = nextIdentity
    } else if (!identity.value) {
      // 连接已建立但身份未知时不得发送，也不猜测账号类型。
      report(new Error('连接未返回有效聊天身份'))
    }
    startHeartbeat()

    const epoch = sessionEpoch
    try {
      await loadRooms()
      if (epoch !== sessionEpoch) return
      const room = active.value
      if (isValidId(room)) {
        socket.emit('join_room', { room_id: room })
        await recoverHistory(epoch, room)
      }
    } catch (e) {
      if (epoch === sessionEpoch) report(e)
    }
  }

  /** 断开连接时停止心跳，但保留已确认身份与资料快照，等待重连恢复。 */
  function onDisconnectEvent() {
    if (disposed) return
    connectionState.value = 'disconnected'
    stopHeartbeat()
  }

  /** 连接失败时先尝试经 REST 刷新令牌，再决定是否重新握手。 */
  async function onConnectErrorEvent(e: unknown) {
    if (disposed) return
    connectionState.value = 'disconnected'
    report(e)
    if (refreshing) return
    refreshing = true
    const previous = auth.token
    try {
      await loadRooms()
      if (auth.token !== previous) connectSocket()
    } catch (failure) {
      report(failure)
    } finally {
      refreshing = false
    }
  }

  /** 展示后端 Socket 下发的错误信息。 */
  function onErrorEvent(e: unknown) {
    report(e)
  }

  /** 解析当前认证主体键，用于区分同账号令牌刷新与账号切换。 */
  function accountKey(): string {
    const id = auth.user?.id
    if (isValidId(id)) return `user:${id}`
    return typeof auth.refreshToken === 'string' && auth.refreshToken
      ? `refresh:${auth.refreshToken}`
      : 'anonymous'
  }

  /** 认证主体变化：同账号刷新仅重连，换号或注销才清空全部状态。 */
  watch(accountKey, (key, previous) => {
    socket.disconnect()
    connectionState.value = 'disconnected'
    if (key === previous) {
      // access token 刷新不代表换账号，保留房间、消息与待确认状态。
      connectSocket()
      return
    }
    resetSession()
    if (auth.token) connectSocket()
  })

  socket.on('connected', onConnectedEvent)
  socket.on('disconnect', onDisconnectEvent)
  socket.on('connect_error', onConnectErrorEvent)
  socket.on('error', onErrorEvent)
  socket.on('message_ack', onAckEvent)
  socket.on('new_message', onNewMessageEvent)

  onMounted(() => {
    // 先并行发起真实 REST 与 Socket，任一失败不阻断另一条链路。
    void loadRooms().catch(report)
    connectSocket()
  })

  onUnmounted(() => {
    disposed = true
    sessionEpoch += 1
    roomEpoch += 1
    stopHeartbeat()
    clearAllTimers()
    socket.off('connected', onConnectedEvent)
    socket.off('disconnect', onDisconnectEvent)
    socket.off('connect_error', onConnectErrorEvent)
    socket.off('error', onErrorEvent)
    socket.off('message_ack', onAckEvent)
    socket.off('new_message', onNewMessageEvent)
    socket.disconnect()
  })

  return {
    rooms,
    active,
    activeRoom,
    messages,
    connected,
    connectionState,
    identity,
    error,
    roomsError,
    historyError,
    pending,
    hasRooms,
    hasHistory,
    loading,
    roomsLoading,
    reconnect,
    loadRooms,
    history,
    read,
    select,
    openPrivate,
    send,
    report
  }
}
