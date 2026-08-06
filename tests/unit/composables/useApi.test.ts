// tests/unit/composables/useApi.test.ts
// 覆盖 useApi 的并发去重、401 静默刷新、错误去重三段关键逻辑。
//
// 隔离策略：
//   - #imports 通过 vitest.config.ts 的 resolve.alias 指向 nuxt-imports-stub.ts。
//     不再用 vi.mock('#imports')，避免与 alias 冲突。
//   - useApi 模块内部持有模块级可变状态（refreshPromise / requestLocks / errorToastCache）。
//     用 vi.resetModules() 在每个测试里拿到全新模块实例。
//   - 关键技巧：resetModules 后 stub 模块也被重置（vi.fn 换成新实例），
//     所以每次 reset 后必须重新从 #imports 导入 stub 引用，否则拿到的是旧实例。
//   - 假 store 放在 globalThis 单例上，避免模块重置后状态丢失。
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

// $fetch 全局 mock（useApi 内部用 globalThis.$fetch 调刷新端点）
const $fetch = vi.fn()
const mockClient = vi.fn()
$fetch.create = vi.fn(() => mockClient) as any
vi.stubGlobal('$fetch', $fetch)

// 全局假 store 状态（跨模块重置保持）
const FAKE_STORE_KEY = '__NUXT_MOCK_STORES__'
function getFakeStores() {
  const g = globalThis as any
  if (!g[FAKE_STORE_KEY]) {
    const token = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    g[FAKE_STORE_KEY] = {
      authState: { token, refreshToken },
      authStore: {
        get token() {
          return token
        },
        get refreshToken() {
          return refreshToken
        },
        isAuthenticated: {
          get value() {
            return !!(token.value || refreshToken.value)
          }
        },
        setAuth: vi.fn((n: any) => {
          if (n.token !== undefined) token.value = n.token
          if (n.refreshToken !== undefined) refreshToken.value = n.refreshToken
        }),
        clearAuth: vi.fn(() => {
          token.value = null
          refreshToken.value = null
        }),
        initAuthFromCookie: vi.fn()
      },
      uiStore: {
        authModalOpen: ref(false),
        authModalView: ref<'login' | 'register'>('login'),
        openAuthModal: vi.fn(),
        closeAuthModal: vi.fn()
      }
    }
  }
  return g[FAKE_STORE_KEY]
}

vi.mock('~/stores/auth', () => ({ useAuthStore: () => getFakeStores().authStore }))
vi.mock('~/stores/ui', () => ({ useUiStore: () => getFakeStores().uiStore }))

describe('useApi', () => {
  let api: any
  let cookieStore: any
  let useCookie: any
  let stubToastAdd: any

  /**
   * 重置模块池 + 所有共享状态，创建全新的 useApi 实例。
   * 必须在 cookieStore seed 之后调用（useApi 内部调用 useCookie 捕获当时的 ref）。
   */
  async function freshApi() {
    vi.resetModules()
    // 重新导入 stub（resetModules 后 stub 的 vi.fn 是新实例）
    const stub = await import('#imports')
    cookieStore = stub.cookieStore
    useCookie = stub.useCookie
    stubToastAdd = stub.toastAdd
    // 重新导入 useApi（全新模块实例，模块级状态归零）
    const mod = await import('~/composables/useApi')
    api = mod.useApi()
    return { api, cookieStore, useCookie, stubToastAdd }
  }

  beforeEach(() => {
    mockClient.mockReset()
    $fetch.mockReset()
    $fetch.create.mockReturnValue(mockClient)
    const { authState, authStore, uiStore } = getFakeStores()
    authState.token.value = null
    authState.refreshToken.value = null
    authStore.setAuth.mockClear()
    authStore.clearAuth.mockClear()
    authStore.initAuthFromCookie.mockClear()
    uiStore.authModalOpen.value = false
    uiStore.authModalView.value = 'login'
    uiStore.openAuthModal.mockClear()
    uiStore.closeAuthModal.mockClear()
  })

  it('GET 请求在 code=200 时解析 data', async () => {
    await freshApi()
    mockClient.mockResolvedValueOnce({ code: 200, message: 'ok', data: { id: 1 } })
    const data = await api.get('/things')
    expect(data).toEqual({ id: 1 })
    expect(mockClient).toHaveBeenCalledWith('/things', { method: 'GET', params: undefined })
  })

  it('POST 请求携带 body', async () => {
    await freshApi()
    mockClient.mockResolvedValueOnce({ code: 200, message: 'ok', data: { created: true } })
    const data = await api.post('/things', { name: 'x' })
    expect(data).toEqual({ created: true })
    expect(mockClient).toHaveBeenCalledWith('/things', { method: 'POST', body: { name: 'x' } })
  })

  it('PUT 与 DELETE 正常工作', async () => {
    await freshApi()
    mockClient.mockResolvedValueOnce({ code: 200, data: 'u' })
    const u = await api.put('/things/1', { name: 'y' })
    expect(u).toBe('u')

    mockClient.mockResolvedValueOnce({ code: 200, data: 'd' })
    const d = await api.del('/things/1')
    expect(d).toBe('d')
  })

  it('业务码非 200 抛 ApiError', async () => {
    await freshApi()
    mockClient.mockResolvedValueOnce({ code: 400, message: '参数错误', data: null })
    await expect(api.get('/x')).rejects.toMatchObject({ code: 400, message: '参数错误' })
  })

  it('网络层错误给出友好提示，不暴露内部 URL', async () => {
    await freshApi()
    mockClient.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(api.get('/x')).rejects.toMatchObject({
      message: '网络连接失败，请检查网络后重试'
    })
  })

  it('并发相同请求复用同一个 Promise（requestLocks 去重）', async () => {
    await freshApi()
    let release!: (v: any) => void
    mockClient.mockImplementationOnce(
      () =>
        new Promise((r) => {
          release = r
        })
    )
    mockClient.mockResolvedValue({ code: 200, data: 'late' })

    const p1 = api.get('/dup')
    const p2 = api.get('/dup')
    expect(mockClient).toHaveBeenCalledTimes(1)

    release!({ code: 200, data: 'first' })
    const [r1, r2] = await Promise.all([p1, p2])
    expect(r1).toBe('first')
    expect(r2).toBe('first')
    expect(mockClient).toHaveBeenCalledTimes(1)
  })

  it('401 触发静默刷新 token，刷新成功后重试原请求', async () => {
    cookieStore.set('auth_token', ref('old'))
    cookieStore.set('refresh_token', ref('rt_valid'))
    await freshApi()

    mockClient
      .mockRejectedValueOnce({
        status: 401,
        message: 'unauthorized',
        data: { message: 'unauthorized' }
      })
      .mockResolvedValueOnce({ code: 200, message: 'ok', data: { secure: true } })
    $fetch.mockResolvedValueOnce({ code: 200, message: 'ok', data: { access_token: 'new_at' } })

    const data = await api.get('/secure')
    expect(data).toEqual({ secure: true })
    expect($fetch).toHaveBeenCalledWith(
      '/api/v1/auth/refreshToken',
      expect.objectContaining({ method: 'POST' })
    )
    const { authStore } = getFakeStores()
    expect(authStore.setAuth).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'new_at', refreshToken: 'rt_valid' })
    )
  })

  it('401 刷新失败时清空认证并弹出登录窗', async () => {
    cookieStore.set('refresh_token', ref('rt_bad'))
    await freshApi()

    mockClient.mockRejectedValueOnce({
      status: 401,
      message: 'unauthorized',
      data: { message: 'unauthorized' }
    })
    $fetch.mockResolvedValueOnce({ code: 200, message: 'ok', data: {} })

    await expect(api.get('/secure')).rejects.toMatchObject({ code: 401 })
    const { authStore, uiStore } = getFakeStores()
    expect(authStore.clearAuth).toHaveBeenCalled()
    expect(uiStore.openAuthModal).toHaveBeenCalledWith('login')
  })

  it('无 refresh_token 时 401 直接走错误处理，不调用刷新', async () => {
    cookieStore.set('auth_token', ref('old'))
    cookieStore.set('refresh_token', ref(null))
    await freshApi()

    mockClient.mockRejectedValueOnce({
      status: 401,
      message: 'unauthorized',
      data: { message: 'unauthorized' }
    })

    await expect(api.get('/secure')).rejects.toMatchObject({ code: 401 })
    expect($fetch).not.toHaveBeenCalled()
  })

  it('并发的多个 401 共享一次 refreshPromise（不重复刷新）', async () => {
    cookieStore.set('refresh_token', ref('rt_ok'))
    await freshApi()

    mockClient
      .mockRejectedValueOnce({ status: 401, data: { message: 'u' } })
      .mockRejectedValueOnce({ status: 401, data: { message: 'u' } })
      .mockResolvedValueOnce({ code: 200, message: 'ok', data: 'a' })
      .mockResolvedValueOnce({ code: 200, message: 'ok', data: 'b' })
    $fetch.mockResolvedValueOnce({ code: 200, message: 'ok', data: { access_token: 'at' } })

    const results = await Promise.all([api.get('/a'), api.get('/b')])
    expect($fetch).toHaveBeenCalledTimes(1)
    expect(results).toEqual(['a', 'b'])
  })

  it('错误 toast 在 2s 窗口内去重（同 code+message 不重复弹）', async () => {
    await freshApi()
    mockClient.mockResolvedValueOnce({ code: 500, message: 'dedup-once', data: null })
    await expect(api.get('/dedup-1')).rejects.toBeDefined()
    expect(stubToastAdd).toHaveBeenCalledTimes(1)
    expect(stubToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'api-error-500', color: 'error' })
    )

    mockClient.mockResolvedValueOnce({ code: 500, message: 'dedup-once', data: null })
    await expect(api.get('/dedup-1')).rejects.toBeDefined()
    expect(stubToastAdd).toHaveBeenCalledTimes(1)
  })

  it('suppressErrorToast=true 时不弹 toast', async () => {
    await freshApi()
    mockClient.mockResolvedValueOnce({ code: 503, message: 'suppressed', data: null })
    await expect(api.get('/x', undefined, { suppressErrorToast: true })).rejects.toBeDefined()
    expect(stubToastAdd).not.toHaveBeenCalled()
  })

  it('401 错误本身不触发 toast（由刷新逻辑接管）', async () => {
    cookieStore.set('refresh_token', ref('rt'))
    await freshApi()

    mockClient.mockRejectedValueOnce({
      status: 401,
      message: 'unauthorized',
      data: { message: 'unauthorized' }
    })
    $fetch.mockResolvedValueOnce({ code: 200, message: 'ok', data: { access_token: 'at' } })
    mockClient.mockResolvedValueOnce({ code: 200, message: 'ok', data: 'ok' })

    await api.get('/secure')
    expect(stubToastAdd).not.toHaveBeenCalled()
  })
})
