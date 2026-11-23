import type { ChatIdentity, ChatParticipant, ChatRoom } from '~/types/chat'

/** 后端缺失字段统一占位，仅用于展示，不作为身份或数据值。 */
export const CHAT_MISSING = '待后端补充'

/** 仅读取真实字符串，空值或非法类型统一返回展示占位。 */
export function getChatText(value?: unknown): string {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || CHAT_MISSING
}

/** 仅接受完整的正安全整数 ID 和非空字符串类型，不将展示占位用于身份判断。 */
export function getChatIdentity(value: unknown): ChatIdentity | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined

  const { id, type } = value as Pick<ChatParticipant, 'id' | 'type'>
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0 || typeof type !== 'string') {
    return undefined
  }

  const identityType = type.trim()
  if (!identityType || identityType === CHAT_MISSING) return undefined
  return { id, type: identityType }
}

/** 判断未知输入是否具有后端认可的完整有效身份。 */
export function hasChatIdentity(value?: unknown): boolean {
  return Boolean(getChatIdentity(value))
}

/** 使用双方明确的账号类型与 ID 判断是否为同一参与者。 */
export function isSameChatParticipant(
  participant?: ChatParticipant | null,
  self?: ChatParticipant | null
): boolean {
  const identity = getChatIdentity(participant)
  const current = getChatIdentity(self)
  return Boolean(
    identity && current && identity.id === current.id && identity.type === current.type
  )
}

/** 仅接受元素全部为非空非数组对象的真实成员数组，保留明确空数组与缺失的区别。 */
export function getChatParticipants(room?: ChatRoom | null): ChatParticipant[] | undefined {
  const participants = room?.participants
  if (!Array.isArray(participants)) return undefined

  for (const participant of participants) {
    if (typeof participant !== 'object' || participant === null || Array.isArray(participant)) {
      return undefined
    }
  }
  return participants
}

/** 优先使用明确的非负安全整数成员数，否则只统计有效真实成员数组。 */
export function getChatMemberCount(room?: ChatRoom | null): number | typeof CHAT_MISSING {
  const count = room?.participant_count
  if (typeof count === 'number' && Number.isSafeInteger(count) && count >= 0) return count
  return getChatParticipants(room)?.length ?? CHAT_MISSING
}

/** 仅在明确私聊且本人身份完整时，按类型与 ID 排除本人并返回真实对方。 */
export function getChatPeer(
  room?: ChatRoom | null,
  self?: Pick<ChatParticipant, 'id' | 'type'> | null
): ChatParticipant | undefined {
  if (room?.type !== 'private' || !getChatIdentity(self)) return undefined
  return getChatParticipants(room)?.find(
    (participant) => getChatIdentity(participant) && !isSameChatParticipant(participant, self)
  )
}

/** 优先显示真实房间名，只有明确私聊才取对方姓名，缺失标题统一标记为待补充。 */
export function getChatTitle(
  room?: ChatRoom | null,
  self?: Pick<ChatParticipant, 'id' | 'type'> | null
): string {
  const name = typeof room?.name === 'string' ? room.name.trim() : ''
  return name || getChatText(getChatPeer(room, self)?.name)
}

/** 仅转换后端明确提供的账号类型，不推断未知社区身份。 */
export function getChatRole(participant?: ChatParticipant | null): string {
  if (participant?.type === 'NormalUser') return '社区成员'
  if (participant?.type === 'AdminUser') return '社区管理员'
  return CHAT_MISSING
}

/** 优先使用明确布尔状态，仅兼容真实在线文案，未知状态不伪装成离线。 */
export function getChatPresence(participant?: ChatParticipant | null): {
  state: 'online' | 'offline' | 'unknown'
  label: string
} {
  if (typeof participant?.is_online === 'boolean') {
    return participant.is_online
      ? { state: 'online', label: '在线' }
      : { state: 'offline', label: '离线' }
  }

  const status =
    typeof participant?.online_status === 'string'
      ? participant.online_status.trim().toLowerCase()
      : undefined
  if (status === 'online' || status === '在线') return { state: 'online', label: '在线' }
  if (status === 'offline' || status === '离线') return { state: 'offline', label: '离线' }
  return { state: 'unknown', label: CHAT_MISSING }
}

/** 仅解析后端真实时间字符串，空值、非法类型或无效时间不生成虚构日期。 */
function parseChatDate(value?: unknown): Date | undefined {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return undefined
  const date = new Date(text)
  return Number.isFinite(date.getTime()) ? date : undefined
}

/** 按本地年月日判断两个时间是否属于同一天。 */
function isSameLocalDay(date: Date, other: Date): boolean {
  return (
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  )
}

/** 使用本地中文二十四小时制展示时分，午夜保持为 00:00。 */
function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  })
}

/** 按本地日历标记今天、昨天，其他日期在跨年时补充年份。 */
function getLocalDateLabel(date: Date, now: Date): string {
  if (isSameLocalDay(date, now)) return '今天'

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameLocalDay(date, yesterday)) return '昨天'

  return date.toLocaleDateString('zh-CN', {
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

/** 将真实聊天时间格式化为本地 HH:mm，缺失或无效时间显示待补充。 */
export function formatChatTime(value?: unknown): string {
  const date = parseChatDate(value)
  return date ? formatLocalTime(date) : CHAT_MISSING
}

/** 将真实时间格式化为今天、昨天或本地日期，缺失时显示待补充。 */
export function formatChatDate(value?: unknown): string {
  const date = parseChatDate(value)
  return date ? getLocalDateLabel(date, new Date()) : CHAT_MISSING
}

/** 会话当天显示时分，其他日期显示本地日期，缺失时间显示待补充。 */
export function formatChatListTime(value?: unknown): string {
  const date = parseChatDate(value)
  if (!date) return CHAT_MISSING

  const now = new Date()
  return isSameLocalDay(date, now) ? formatLocalTime(date) : getLocalDateLabel(date, now)
}

/** 使用明确在线状态或真实最近活跃时间，不为缺失字段生成活跃记录。 */
export function formatChatLastSeen(participant?: ChatParticipant | null): string {
  const presence = getChatPresence(participant)
  if (presence.state === 'online') return '当前在线'

  const date = parseChatDate(participant?.last_seen_at)
  if (!date) return CHAT_MISSING

  const now = new Date()
  const elapsed = now.getTime() - date.getTime()
  if (elapsed >= 0 && elapsed < 60_000) return '刚刚'
  if (elapsed >= 60_000 && elapsed < 3_600_000) {
    return `${Math.floor(elapsed / 60_000)} 分钟前`
  }
  return `${getLocalDateLabel(date, now)} ${formatLocalTime(date)}`
}
