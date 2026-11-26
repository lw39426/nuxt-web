import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import * as h3 from 'h3'
import { $fetch } from 'ofetch'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { proxyOnly } from '../../../server/utils/bff'

const servers: Server[] = []
const received: Array<{ path: string; headers: h3.H3Event['node']['req']['headers']; body: any }> =
  []
let baseURL: string

async function listen(handler: ReturnType<typeof h3.toNodeListener>) {
  const server = createServer(handler)
  servers.push(server)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`
}

beforeAll(async () => {
  vi.stubGlobal('defineEventHandler', h3.defineEventHandler)
  const { default: login } = await import('../../../server/api/v1/auth/login.post')
  const { default: catchAll } = await import('../../../server/api/v1/[...path]')
  for (const name of [
    'getHeader',
    'getCookie',
    'getRequestIP',
    'readBody',
    'getQuery',
    'createError',
    'getRouterParam'
  ]) {
    vi.stubGlobal(name, h3[name as keyof typeof h3])
  }
  vi.stubGlobal('$fetch', $fetch)
  vi.stubGlobal('proxyOnly', proxyOnly)
  const upstream = h3.createApp().use(
    h3.defineEventHandler(async (event) => {
      received.push({
        path: event.path,
        headers: event.node.req.headers,
        body: await h3.readBody(event)
      })
      return { code: 200, message: 'success', data: { access_token: 'test-token' } }
    })
  )
  const upstreamURL = await listen(h3.toNodeListener(upstream))
  vi.stubGlobal('useRuntimeConfig', () => ({
    apiSecretBase: `${upstreamURL}/api/v1`,
    apiTimeout: 2000
  }))
  const bff = h3.createApp().use(
    h3.defineEventHandler((event) => {
      event.context.params = { path: event.path.replace('/api/v1/', '') }
      return event.path === '/api/v1/auth/login' ? login(event) : catchAll(event)
    })
  )
  baseURL = await listen(h3.toNodeListener(bff))
})

afterAll(async () => {
  await Promise.all(
    servers.map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()))
          server.closeAllConnections()
        })
    )
  )
  vi.unstubAllGlobals()
})

describe('登录 BFF 的真实 HTTP 转发', () => {
  it.each([
    ['loginByUsername', { username: 'test', password: 'test' }],
    ['loginByPhone', { phone: '13800000000', code: '123456' }],
    ['wxLogin', { code: 'test-wx-code' }],
    ['login', { username: 'test', password: 'test' }]
  ])('%s 保留原始 UA、登录参数和鉴权头，仅转发必要请求头', async (method, body) => {
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36'
    const response = await $fetch(`/api/v1/auth/${method}`, {
      baseURL,
      method: 'POST',
      body,
      headers: {
        'User-Agent': userAgent,
        Authorization: 'Bearer existing-token',
        Cookie: 'auth_token=cookie-token',
        'X-Unrelated': 'private'
      }
    })
    expect(response.data.access_token).toBe('test-token')
    const request = received.at(-1)!
    expect(request.path).toBe(`/api/v1/auth/${method}`)
    expect(request.body).toEqual(body)
    expect(request.headers['user-agent']).toBe(userAgent)
    expect(request.headers.authorization).toBe('Bearer existing-token')
    expect(request.headers.cookie).toBe('auth_token=cookie-token')
    expect(request.headers['x-unrelated']).toBeUndefined()
  })

  it('并发请求保持各自 UA，不复用其他用户的信息', async () => {
    const agents = ['Test-Desktop-UA', 'Test-Mobile-UA']
    const start = received.length
    await Promise.all(
      agents.map((agent) =>
        $fetch('/api/v1/auth/loginByUsername', {
          baseURL,
          method: 'POST',
          headers: { 'User-Agent': agent },
          body: { username: 'same', password: 'same' }
        })
      )
    )
    expect(
      received
        .slice(start)
        .map((request) => request.headers['user-agent'])
        .sort()
    ).toEqual(agents.sort())
  })

  it('原请求缺少 UA 时不构造浏览器 UA', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ code: 200, data: null })
    vi.stubGlobal('$fetch', fetchSpy)
    try {
      await $fetch('/api/v1/auth/loginByUsername', {
        baseURL,
        method: 'POST',
        headers: { 'User-Agent': '' },
        body: { username: 'test', password: 'test' }
      })
      expect(fetchSpy.mock.calls[0][1].headers).not.toHaveProperty('User-Agent')
    } finally {
      vi.stubGlobal('$fetch', $fetch)
    }
  })
})
