// @vitest-environment happy-dom
// tests/unit/composables/useChat.test.ts
// 覆盖真实聊天传输的关键契约：
//   - 非法 ID/字段拒绝进入界面
//   - ACK 与 new_message 乱序只保留一条永久消息，且不擦除真实 sender
//   - 切房与重连的过期响应不写回当前视图
//   - 同账号 token 刷新保留资料，换号/注销清空
//
// 隔离策略：
//   - #imports 走 vitest.config.ts 的 alias，不使用 vi.mock('#imports')。
//   - socket.io-client 用可控假 socket 替代，记录监听器与 emit 负载。
//   - useApi 用桩替代，只暴露 get/post，并保留请求参数供断言。
//   - 假 auth store 用 reactive 状态建模 Pinia 解包后的响应式原始值。

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, reactive, type App } from 'vue'

/** 可控假 Socket：记录监听器、连接状态与发送负载。 */
const harness = vi.hoisted(() => {
  class FakeSocket {
    connected = false
    listeners = new Map<string, (...args: any[]) => void>()
    emitted: Array<{ event: string; payload: any }> = []
    disconnected = 0

    on(event: string, handler: (...args: any[]) => void) {
      this.listeners.set(event, handler)
    }

    off(event: string) {
      this.listeners.delete(event)
    }

    connect() {
      this.connected = true
    }

    disconnect() {
      this.connected = false
      this.disconnected += 1
    }

    emit(event: string, payload?: any) {
      this.emitted.push({ event, payload })
    }

    /** 触发服务端事件，模拟 Socket.IO 回调。 */
    trigger(event: string, payload?: unknown) {
      this.listeners.get(event)?.(payload)
    }
  }

  return {
    fakeSocket: new FakeSocket(),
    apiGet: vi.fn(),
    apiPost: vi.fn()
  }
})

const { fakeSocket, apiGet, apiPost } = harness

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => fakeSocket)
}))

// useApi / useRuntimeConfig 是 Nuxt 自动导入，Vitest 中源码没有 import 语句，
// 通过全局桩注入，供 useChat.ts 的裸标识符解析。
function stubAutoImports() {
  vi.stubGlobal('useApi', () => ({ get: apiGet, post: apiPost, put: vi.fn(), del: vi.fn() }))
  vi.stubGlobal('useRuntimeConfig', () => ({
    public: { chatSocketOrigin: '', useMock: false }
  }))
}

/** 假 auth store 的响应式状态，挂在 globalThis 上供 mock 工厂读取。 */
const AUTH_STATE_KEY = '__NUXT_MOCK_CHAT_AUTH__'
const AUTH_MOCKS_KEY = '__NUXT_MOCK_CHAT_AUTH_MOCKS__'

const authState = reactive({
  token: 'token-a' as string | null,
  refreshToken: 'refresh-a' as string | null,
  user: { id: 1, username: 'A' } as { id: number; username: string } | null
})
const authMocks = { setAuth: vi.fn(), clearAuth: vi.fn() }
;(globalThis as any)[AUTH_STATE_KEY] = authState
;(globalThis as any)[AUTH_MOCKS_KEY] = authMocks

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => {
    const state = (globalThis as any)[AUTH_STATE_KEY]
    const mocks = (globalThis as any)[AUTH_MOCKS_KEY]
    return {
      get token() {
        return state.token
      },
      get refreshToken() {
        return state.refreshToken
      },
      get user() {
        return state.user
      },
      setAuth: mocks.setAuth,
      clearAuth: mocks.clearAuth
    }
  }
}))

/** 在真实 Vue 组件 setup 中调用 useChat，确保 onMounted/onUnmounted 绑定。 */
async function mountChat() {
  vi.resetModules()
  const mod = await import('~/composables/useChat')
  let chat: any
  const app: App = createApp({
    setup() {
      chat = mod.useChat()
      return () => null
    }
  })
  app.config.warnHandler = () => {}
  const host = document.createElement('div')
  document.body.appendChild(host)
  app.mount(host)
  return { chat, app, host }
}

describe('useChat 真实传输', () => {
  let app: App | undefined
  let host: HTMLDivElement | undefined

  /** 创建挂载实例并返回 composable。 */
  async function setup() {
    const ctx = await mountChat()
    app = ctx.app
    host = ctx.host
    return ctx.chat as any
  }

  /** 卸载实例，触发 onUnmounted 清理。 */
  function teardown() {
    app?.unmount()
    host?.remove()
    app = undefined
    host = undefined
  }

  beforeEach(() => {
    fakeSocket.connected = false
    fakeSocket.listeners.clear()
    fakeSocket.emitted.length = 0
    fakeSocket.disconnected = 0
    apiGet.mockReset()
    apiPost.mockReset()
    authMocks.setAuth.mockClear()
    authMocks.clearAuth.mockClear()
    authState.token = 'token-a'
    authState.refreshToken = 'refresh-a'
    authState.user = { id: 1, username: 'A' }
    stubAutoImports()
    vi.stubGlobal('crypto', {
      randomUUID: () => `temp-${Math.random().toString(16).slice(2)}`
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('挂载时并行发起真实列表请求与 Socket 握手，并注册事件监听', async () => {
    apiGet.mockResolvedValue({ rooms: [], pagination: { has_next: false } })
    const chat = await setup()

    expect(apiGet).toHaveBeenCalledWith(
      '/chat/rooms',
      { page: 1, per_page: 20 },
      expect.objectContaining({ scope: 'chat:user:1' })
    )
    expect(fakeSocket.connected).toBe(true)
    expect(fakeSocket.listeners.has('connected')).toBe(true)
    expect(fakeSocket.listeners.has('message_ack')).toBe(true)
    expect(chat.connectionState.value).toBe('connecting')

    teardown()
  })

  it('拒绝非法房间与非法消息，保留真实字段', async () => {
    apiGet
      .mockResolvedValueOnce({
        rooms: [
          { id: 0, type: 'private' },
          { id: '2', type: 'private' },
          { id: 3, type: 'private', name: '真实会话', participant_count: 2 },
          null
        ],
        pagination: { has_next: false }
      })
      .mockResolvedValueOnce({ messages: [], pagination: { has_next: false } })
    const chat = await setup()
    await nextTick()
    await chat.select(3)

    expect(chat.rooms.value).toEqual([
      { id: 3, type: 'private', name: '真实会话', participant_count: 2 }
    ])

    fakeSocket.trigger('new_message', { message_id: -1, room_id: 3, content: '非法' })
    fakeSocket.trigger('new_message', { message_id: 7, room_id: 3, content: '真实消息' })
    fakeSocket.trigger('new_message', { id: 8, room_id: 3, content: '兼容 ID' })
    expect(chat.messages.value.map((m: any) => m.id)).toEqual([7, 8])

    teardown()
  })

  it('分页字段缺失保持未知，不误判为没有更多', async () => {
    apiGet.mockResolvedValueOnce({ rooms: [{ id: 1 }] })
    const chat = await setup()
    await nextTick()

    expect(chat.hasRooms.value).toBeNull()
    expect(chat.roomsLoading.value).toBe(false)

    teardown()
  })

  it('ACK 先到再收到 new_message 时只保留一条，且不擦除真实 sender', async () => {
    apiGet
      .mockResolvedValueOnce({
        rooms: [{ id: 1, type: 'private', participants: [{ id: 1, type: 'NormalUser' }] }],
        pagination: { has_next: false }
      })
      .mockResolvedValueOnce({ messages: [], pagination: { has_next: false } })
    const chat = await setup()
    await chat.select(1)
    await nextTick()

    fakeSocket.trigger('connected', { status: 'ok', user_id: 1, user_type: 'NormalUser' })
    await nextTick()
    expect(chat.identity.value).toEqual({ id: 1, type: 'NormalUser' })
    expect(chat.connected.value).toBe(true)

    expect(chat.send('你好')).toBe(true)
    const temp = fakeSocket.emitted.find((e) => e.event === 'send_message')?.payload?.temp_id
    expect(temp).toBeTruthy()

    fakeSocket.trigger('message_ack', {
      temp_id: temp,
      success: true,
      message_id: 100,
      sequence: 1,
      timestamp: '2026-11-19T03:00:00Z'
    })
    expect(Object.keys(chat.pending)).toEqual([])
    expect(chat.messages.value).toHaveLength(1)

    fakeSocket.trigger('new_message', {
      message_id: 100,
      room_id: 1,
      content: '你好',
      message_type: 'text',
      sequence: 1,
      created_at: '2026-11-19T03:00:00Z',
      sender: { id: 1, type: 'NormalUser', name: '本人' },
      is_own: true
    })
    expect(chat.messages.value).toHaveLength(1)
    expect(chat.messages.value[0]).toMatchObject({
      id: 100,
      room_id: 1,
      content: '你好',
      sender: { id: 1, type: 'NormalUser', name: '本人' },
      is_own: true
    })

    teardown()
  })

  it('new_message 先到再收到 ACK 时同样合并为一条永久消息', async () => {
    apiGet
      .mockResolvedValueOnce({
        rooms: [{ id: 1, type: 'private' }],
        pagination: { has_next: false }
      })
      .mockResolvedValueOnce({ messages: [], pagination: { has_next: false } })
    const chat = await setup()
    await chat.select(1)
    fakeSocket.trigger('connected', { user_id: 1, user_type: 'NormalUser' })
    await nextTick()

    chat.send('在吗')
    const temp = fakeSocket.emitted.find((e) => e.event === 'send_message')?.payload?.temp_id

    fakeSocket.trigger('new_message', {
      message_id: 101,
      room_id: 1,
      content: '在吗',
      created_at: '2026-11-19T03:01:00Z',
      sender: { id: 1, type: 'NormalUser', name: '本人' },
      is_own: true
    })
    fakeSocket.trigger('message_ack', {
      temp_id: temp,
      success: true,
      message_id: 101,
      timestamp: '2026-11-19T03:01:00Z'
    })

    expect(chat.messages.value).toHaveLength(1)
    expect(chat.messages.value[0].sender).toEqual({ id: 1, type: 'NormalUser', name: '本人' })
    expect(Object.keys(chat.pending)).toEqual([])

    teardown()
  })

  it('ACK 明确失败保留待确认原因，不删除也不自动重发', async () => {
    apiGet
      .mockResolvedValueOnce({
        rooms: [{ id: 1, type: 'private' }],
        pagination: { has_next: false }
      })
      .mockResolvedValueOnce({ messages: [], pagination: { has_next: false } })
    const chat = await setup()
    await chat.select(1)
    fakeSocket.trigger('connected', { user_id: 1, user_type: 'NormalUser' })
    await nextTick()

    chat.send('失败消息')
    const temp = fakeSocket.emitted.find((e) => e.event === 'send_message')?.payload?.temp_id
    fakeSocket.trigger('message_ack', { temp_id: temp, success: false, error: '内容被拒绝' })

    expect(chat.pending[temp]?.status).toBe('内容被拒绝')
    expect(fakeSocket.emitted.filter((e) => e.event === 'send_message')).toHaveLength(1)

    teardown()
  })

  it('切房后旧房间的历史响应不写回新房间', async () => {
    apiGet.mockImplementation(async (url: string) => {
      if (url === '/chat/rooms') {
        return {
          rooms: [
            { id: 1, type: 'private', name: '房间一' },
            { id: 2, type: 'private', name: '房间二' }
          ],
          pagination: { has_next: false }
        }
      }
      if (url === '/chat/rooms/1/messages') {
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                messages: [{ id: 11, room_id: 1, content: '旧房间' }],
                pagination: { has_next: false }
              }),
            20
          )
        )
      }
      return {
        messages: [{ id: 21, room_id: 2, content: '新房间' }],
        pagination: { has_next: false }
      }
    })

    const chat = await setup()
    await nextTick()

    const first = chat.select(1)
    await chat.select(2)
    await first
    await nextTick()

    expect(chat.active.value).toBe(2)
    expect(chat.messages.value.map((m: any) => m.id)).toEqual([21])

    teardown()
  })

  it('重连后按永久 ID 合并历史，不产生重复气泡', async () => {
    apiGet.mockImplementation(async (url: string) => {
      if (url === '/chat/rooms') {
        return { rooms: [{ id: 1, type: 'private' }], pagination: { has_next: false } }
      }
      return {
        messages: [
          { id: 30, room_id: 1, content: '旧', created_at: '2026-11-19T01:00:00Z' },
          { id: 31, room_id: 1, content: '新', created_at: '2026-11-19T02:00:00Z' }
        ],
        pagination: { has_next: false }
      }
    })

    const chat = await setup()
    await nextTick()
    await chat.select(1)
    fakeSocket.trigger('connected', { user_id: 1, user_type: 'NormalUser' })
    await vi.waitFor(() => {
      expect(chat.messages.value.map((m: any) => m.id)).toEqual([30, 31])
    })

    fakeSocket.trigger('disconnect')
    expect(chat.connectionState.value).toBe('disconnected')
    fakeSocket.trigger('connected', { user_id: 1, user_type: 'NormalUser' })
    await vi.waitFor(() => {
      expect(chat.messages.value.map((m: any) => m.id)).toEqual([30, 31])
    })

    teardown()
  })

  it('同账号 access token 刷新保留房间、消息与身份', async () => {
    apiGet.mockImplementation(async (url: string) => {
      if (url === '/chat/rooms') {
        return { rooms: [{ id: 1, type: 'private' }], pagination: { has_next: false } }
      }
      return {
        messages: [{ id: 40, room_id: 1, content: '保留' }],
        pagination: { has_next: false }
      }
    })

    const chat = await setup()
    await nextTick()
    await chat.select(1)
    fakeSocket.trigger('connected', { user_id: 1, user_type: 'NormalUser' })
    await nextTick()
    expect(chat.messages.value).toHaveLength(1)

    authState.token = 'token-b'
    await nextTick()

    expect(chat.identity.value).toEqual({ id: 1, type: 'NormalUser' })
    expect(chat.active.value).toBe(1)
    expect(chat.messages.value.map((m: any) => m.id)).toEqual([40])
    expect(authMocks.clearAuth).not.toHaveBeenCalled()

    teardown()
  })

  it('切换账号时清空旧会话并断开连接', async () => {
    apiGet.mockImplementation(async (url: string) => {
      if (url === '/chat/rooms') {
        return { rooms: [{ id: 1, type: 'private' }], pagination: { has_next: false } }
      }
      return { messages: [], pagination: { has_next: false } }
    })
    const chat = await setup()
    await nextTick()
    await chat.select(1)
    fakeSocket.trigger('connected', { user_id: 1, user_type: 'NormalUser' })
    await nextTick()

    authState.user = { id: 2, username: 'B' }
    authState.token = 'token-b'
    await nextTick()

    expect(chat.rooms.value).toEqual([])
    expect(chat.active.value).toBeNull()
    expect(chat.identity.value).toBeNull()
    expect(chat.messages.value).toEqual([])
    expect(fakeSocket.disconnected).toBeGreaterThan(0)

    teardown()
  })

  it('未确认连接、无有效身份或空内容时拒绝发送', async () => {
    apiGet.mockImplementation(async (url: string) => {
      if (url === '/chat/rooms') {
        return { rooms: [{ id: 1, type: 'private' }], pagination: { has_next: false } }
      }
      return { messages: [], pagination: { has_next: false } }
    })
    const chat = await setup()
    await nextTick()
    await chat.select(1)

    expect(chat.send('   ')).toBe(false)
    expect(chat.send('内容')).toBe(false)

    fakeSocket.trigger('connected', { user_id: 1, user_type: 'NormalUser' })
    await nextTick()
    expect(chat.send('')).toBe(false)
    expect(chat.send('有效')).toBe(true)

    teardown()
  })

  it('历史失败保留错误信息，不展示空数据为成功', async () => {
    apiGet
      .mockResolvedValueOnce({
        rooms: [{ id: 1, type: 'private' }],
        pagination: { has_next: false }
      })
      .mockRejectedValueOnce(new Error('历史加载失败'))

    const chat = await setup()
    await nextTick()
    await expect(chat.select(1)).rejects.toMatchObject({ message: '历史加载失败' })

    expect(chat.historyError.value).toBe('历史加载失败')
    expect(chat.messages.value).toEqual([])

    teardown()
  })

  it('卸载后回调不再写入状态', async () => {
    apiGet.mockResolvedValue({
      rooms: [{ id: 1, type: 'private' }],
      pagination: { has_next: false }
    })
    const chat = await setup()
    await nextTick()
    teardown()

    expect(() =>
      fakeSocket.trigger('new_message', { message_id: 1, room_id: 1, content: '迟到' })
    ).not.toThrow()
    expect(chat.messages.value).toEqual([])
  })
})
