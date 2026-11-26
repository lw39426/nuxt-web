import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cookieStore } from '#imports'
import { ref } from 'vue'
import { useApi } from '../../../app/composables/useApi'

vi.mock('~/stores/auth', () => ({ useAuthStore: vi.fn() }))
vi.mock('~/stores/ui', () => ({ useUiStore: vi.fn() }))

const mockClient = vi.fn()
const mockFetch = Object.assign(vi.fn(), {
  create: vi.fn<(...args: any[]) => typeof mockClient>(() => mockClient)
})
const requestHeaders = vi.fn()

beforeEach(() => {
  mockClient.mockReset()
  mockFetch.mockReset()
  mockFetch.create.mockClear()
  requestHeaders.mockReset()
  cookieStore.clear()
  vi.stubGlobal('$fetch', mockFetch)
  vi.stubGlobal('useRequestHeaders', requestHeaders)
})

afterEach(() => vi.unstubAllGlobals())

describe('useApi SSR 请求上下文', () => {
  it('读取各自请求 UA，Bearer 拦截器保留 Headers 中的 UA', () => {
    cookieStore.set('auth_token', ref('test-token'))
    requestHeaders.mockReturnValueOnce({ 'user-agent': 'Desktop-UA' })
    useApi()
    requestHeaders.mockReturnValueOnce({ 'user-agent': 'Mobile-UA' })
    useApi()
    const [desktop, mobile] = mockFetch.create.mock.calls.map(([options]) => options)
    expect(requestHeaders).toHaveBeenCalledWith(['user-agent'])
    expect(desktop.headers).toEqual({ 'user-agent': 'Desktop-UA' })
    expect(mobile.headers).toEqual({ 'user-agent': 'Mobile-UA' })
    const options = { headers: new Headers(desktop.headers) }
    desktop.onRequest({ options })
    expect(options.headers.get('user-agent')).toBe('Desktop-UA')
    expect(options.headers.get('authorization')).toBe('Bearer test-token')
  })

  it('不同 SSR 实例的相同登录请求不共用 Promise', async () => {
    requestHeaders.mockReturnValueOnce({ 'user-agent': 'Desktop-UA' })
    const desktop = useApi()
    requestHeaders.mockReturnValueOnce({ 'user-agent': 'Mobile-UA' })
    const mobile = useApi()
    mockClient.mockResolvedValue({ code: 200, data: { access_token: 'test-token' } })
    const body = { username: 'test', password: 'test' }
    await Promise.all([
      desktop.post('/auth/loginByUsername', body),
      mobile.post('/auth/loginByUsername', body)
    ])
    expect(mockClient).toHaveBeenCalledTimes(2)
  })

  it('401 刷新请求也保留当前 SSR UA', async () => {
    cookieStore.set('refresh_token', ref('test-refresh-token'))
    requestHeaders.mockReturnValue({ 'user-agent': 'Desktop-UA' })
    const api = useApi()
    mockClient.mockRejectedValueOnce({ status: 401 })
    mockClient.mockResolvedValueOnce({ code: 200, data: {} })
    mockFetch.mockResolvedValueOnce({ code: 200, data: { access_token: 'new-token' } })
    await api.get('/user/info')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/refreshToken', {
      method: 'POST',
      headers: { 'user-agent': 'Desktop-UA', Authorization: 'Bearer test-refresh-token' }
    })
  })
})
