import type { H3Event } from 'h3'

/** 统一响应结构，与 Flask 后端及前端 useApi 约定保持一致 */
export interface BffResponse<T> {
  code: number
  message: string
  data: T
}

/** 代理请求可选配置 */
export interface ProxyOptions {
  /** 转发到 Flask 的方法，默认沿用当前请求的方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** 显式指定 query，默认沿用当前请求的 query */
  query?: Record<string, any>
  /** 显式指定 body，默认在非 GET 请求时自动读取当前请求的 body */
  body?: any
  /** 是否透传浏览器 Cookie，默认 true */
  forwardCookie?: boolean
}

/**
 * 从请求中解析出用于鉴权的 Token
 * 优先取 Authorization 请求头，其次回退到 auth_token Cookie
 */
export function resolveAuthToken(event: H3Event): string | null {
  const authHeader = getHeader(event, 'authorization')
  if (authHeader) {
    return authHeader.replace(/^Bearer\s+/i, '')
  }
  return getCookie(event, 'auth_token') || null
}

/**
 * 构造转发给 Flask 的请求头
 * 注入 Bearer Token 与真实客户端 IP，便于后端鉴权与日志追踪
 */
function buildForwardHeaders(event: H3Event, forwardCookie: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json'
  }

  const token = resolveAuthToken(event)
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (forwardCookie) {
    const cookie = getHeader(event, 'cookie')
    if (cookie) headers.Cookie = cookie
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true })
  if (clientIp) {
    headers['X-Forwarded-For'] = clientIp
  }

  return headers
}

/**
 * 判断当前是否处于强制 Mock 模式
 * NUXT_PUBLIC_USE_MOCK=true 时不发起任何 Flask 请求
 */
export function isMockMode(): boolean {
  return useRuntimeConfig().public.useMock === true
}

/**
 * 代理请求到 Flask 后端
 * 成功时返回后端原始响应体；失败时抛出错误，由 withMockFallback 决定是否降级
 */
export async function proxyToBackend<T>(
  event: H3Event,
  path: string,
  options: ProxyOptions = {}
): Promise<BffResponse<T>> {
  const config = useRuntimeConfig()
  const method = options.method || (event.method as ProxyOptions['method']) || 'GET'
  const forwardCookie = options.forwardCookie !== false

  // 非 GET 请求在未显式传入 body 时，自动读取当前请求体转发
  let body = options.body
  if (body === undefined && method !== 'GET') {
    body = await readBody(event).catch(() => undefined)
  }

  return await $fetch<BffResponse<T>>(`/api/v1${path}`, {
    baseURL: config.apiSecretBase,
    method,
    query: options.query ?? getQuery(event),
    body,
    headers: buildForwardHeaders(event, forwardCookie),
    timeout: config.apiTimeout,
    retry: 0
  })
}

/**
 * BFF 核心方法：优先代理到 Flask，异常时降级返回本地 Mock 数据
 *
 * @param event   当前请求上下文
 * @param path    Flask 侧的相对路径（不含 /api/v1 前缀），如 '/home/data'
 * @param mock    Mock 数据工厂函数，仅在强制 Mock 或代理失败时调用
 * @param options 代理请求可选配置
 */
export async function withMockFallback<T>(
  event: H3Event,
  path: string,
  mock: () => T | Promise<T>,
  options: ProxyOptions = {}
): Promise<BffResponse<T>> {
  const buildMock = async (reason: string): Promise<BffResponse<T>> => {
    if (import.meta.dev) {
      console.info(`[BFF] ${path} 使用 Mock 数据（${reason}）`)
    }
    setResponseHeader(event, 'X-Data-Source', 'mock')
    return { code: 200, message: 'success', data: await mock() }
  }

  if (isMockMode()) {
    return buildMock('USE_MOCK=true')
  }

  try {
    const res = await proxyToBackend<T>(event, path, options)
    setResponseHeader(event, 'X-Data-Source', 'backend')
    return res
  } catch (error: any) {
    const status = error?.status || error?.statusCode

    // 鉴权与客户端参数错误属于业务语义，必须原样透传，不能用 Mock 掩盖
    if (status === 401 || status === 403 || status === 422) {
      throw createError({
        statusCode: status,
        message: error?.data?.message || error?.statusMessage || '请求被拒绝',
        data: error?.data
      })
    }

    console.error(`[BFF] ${path} 代理失败:`, error?.message || error)
    return buildMock(`代理失败: ${status || 'network'}`)
  }
}

/**
 * 纯代理方法：不提供 Mock 降级，失败时直接抛出归一化错误
 * 适用于登录、支付等不允许返回假数据的写操作
 */
export async function proxyOnly<T>(
  event: H3Event,
  path: string,
  options: ProxyOptions = {}
): Promise<BffResponse<T>> {
  try {
    return await proxyToBackend<T>(event, path, options)
  } catch (error: any) {
    const status = error?.status || error?.statusCode || 502
    throw createError({
      statusCode: status,
      message: error?.data?.message || error?.statusMessage || '后端服务不可用',
      data: error?.data
    })
  }
}
