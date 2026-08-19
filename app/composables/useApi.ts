import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { useRuntimeConfig, useCookie, useToast } from '#imports'

export interface ApiError {
  code?: number
  message: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp?: string
}

export interface ApiRequestOptions {
  suppressErrorToast?: boolean
}

/**
 * 创建通用的 API 客户端，自动附加 baseURL、凭据与 Bearer Token
 */
// 全局的静默刷新锁，防止多个 401 请求触发多次 refresh
let refreshPromise: Promise<boolean> | null = null
// 全局错误提示防抖缓存，避免满屏弹窗
const errorToastCache = new Set<string>()
// 全局请求队列（Promise Lock 机制），防止完全相同的并发请求
const requestLocks = new Map<string, Promise<any>>()

export function useApi() {
  const config = useRuntimeConfig()
  // 优先使用 NUXT_PUBLIC_API_BASE，客户端与服务端均直连后端（需后端开启 CORS）
  // 未配置时回退：服务端走内网直连（BFF模式），客户端走相对路径同源请求 Nuxt Server 的 API 路由
  const apiBase =
    (config.public.apiBase as string) ||
    (import.meta.server ? (config.apiSecretBase as string) : '')
  const authStore = import.meta.client ? useAuthStore() : null
  const uiStore = import.meta.client ? useUiStore() : null
  const tokenCookie = useCookie<string | null>('auth_token')
  const refreshTokenCookie = useCookie<string | null>('refresh_token')
  const toast = import.meta.client ? useToast() : null

  const baseURL = apiBase ? `${apiBase}/api/v1` : '/api/v1'

  // if (import.meta.dev) {
  //   console.log(`[${import.meta.server ? 'SERVER' : 'CLIENT'}] 当前请求 baseURL:`, baseURL)
  // }
  const client = $fetch.create({
    baseURL,
    credentials: 'include',
    // 全局请求拦截器：添加 Bearer Token
    onRequest({ options }) {
      // 优先从内存状态中获取 token，其次从 cookie 获取
      const t = authStore?.token || tokenCookie.value
      if (t) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${t}`
        } as any
      }
    }
  })

  /**
   * 统一错误处理与 Toast 提示
   *
   * 区分两类错误：
   * 1. 网络层错误（服务端无响应、DNS 失败、超时）→ 友好提示，不暴露内部 URL
   * 2. 业务层错误（HTTP 4xx/5xx 且有响应体）→ 展示服务端返回的消息
   */
  function handleError(e: any, suppressErrorToast = false): never {
    const statusCode = e?.status || e?.code
    const rawMessage = e?.data?.message || e?.message || ''

    // 判断是否为网络层错误：无状态码，或错误信息包含浏览器 fetch 失败的特征
    const isNetworkError =
      !statusCode ||
      statusCode === 0 ||
      /Failed to fetch|fetch failed|NetworkError|ECONNREFUSED|timeout/i.test(rawMessage)

    const err: ApiError = {
      message: isNetworkError
        ? '网络连接失败，请检查网络后重试'
        : rawMessage || '系统繁忙，请稍后再试',
      code: statusCode
    }

    // 在客户端使用 Nuxt UI 的 Toast 弹出错误提示
    if (!suppressErrorToast && import.meta.client && toast && err.code !== 401) {
      // 构造唯一错误标识，防抖处理
      const errorKey = `${err.code || 'unknown'}_${err.message}`

      if (!errorToastCache.has(errorKey)) {
        errorToastCache.add(errorKey)

        toast.add({
          id: `api-error-${err.code || 'global'}`, // 同一个 id 在 Nuxt UI 中会替换掉旧弹窗，而不是堆叠
          title: isNetworkError ? '网络异常' : '请求失败',
          description: err.message,
          color: 'error'
        })

        // 2秒后清除该错误标识，允许再次触发同样的提示
        setTimeout(() => {
          errorToastCache.delete(errorKey)
        }, 2000)
      }
    }

    throw err
  }

  /**
   * 核心请求包装函数（含 401 静默刷新及竞态锁逻辑）
   */
  async function request<T>(
    url: string,
    options: any,
    requestOptions: ApiRequestOptions = {}
  ): Promise<T> {
    // 生成唯一请求指纹 (Method + URL + Params + Body)
    const requestKey = `${options.method || 'GET'}_${url}_${JSON.stringify(options.params || {})}_${JSON.stringify(options.body || {})}`

    // 如果已经有完全相同的请求在进行中，直接复用它的 Promise，防止并发竞态
    if (requestLocks.has(requestKey)) {
      if (import.meta.dev) {
        console.log(`🚀 [Request Queue] 命中并发请求锁，复用请求:`, url)
      }
      return requestLocks.get(requestKey)
    }

    const execute = async (): Promise<T> => {
      try {
        const response = await client<ApiResponse<T>>(url, options)
        if (response.code !== 200) {
          throw {
            message: response.message || '业务处理失败',
            code: response.code
          }
        }
        return response.data
      } catch (e: any) {
        const statusCode = e?.status || e?.code
        const isUnauthorized = statusCode === 401

        // 非 401 错误，直接走全局错误处理
        if (!isUnauthorized) {
          return handleError(e, requestOptions.suppressErrorToast)
        }

        // 处理 401 静默刷新
        if (!refreshPromise) {
          // 如果当前没有刷新任务，发起刷新
          refreshPromise = new Promise((resolve) => {
            if (import.meta.dev) {
              console.log('🔄 检测到 401，开始静默刷新 Token...')
            }
            const rt = refreshTokenCookie.value

            if (!rt) {
              refreshPromise = null
              resolve(false)
              return
            }
            ;(async () => {
              try {
                // 注意：这里必须使用无拦截器的 fetch 或者特定逻辑，防止死循环
                // 且不带 Bearer，因为我们要传 refresh_token
                const refreshRes = await $fetch<ApiResponse<{ access_token: string }>>(
                  '/api/v1/auth/refreshToken',
                  {
                    baseURL: apiBase,
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${rt}`
                    }
                  }
                )

                if (refreshRes.code === 200 && refreshRes.data?.access_token) {
                  // 刷新成功，更新 token 状态
                  authStore?.setAuth({
                    token: refreshRes.data.access_token,
                    refreshToken: rt,
                    user: null
                  })
                  if (import.meta.dev) {
                    console.log('✅ Token 刷新成功')
                  }
                  resolve(true)
                } else {
                  throw new Error('刷新失败')
                }
              } catch (err) {
                console.error('❌ Token 刷新失败，需重新登录', err)
                authStore?.clearAuth()
                if (import.meta.client) {
                  uiStore?.openAuthModal('login')
                }
                resolve(false)
              } finally {
                // 请求完成，释放锁
                refreshPromise = null
              }
            })()
          })
        }

        // 等待刷新结果（不管是第一个发起刷新的请求，还是后续被挂起的并发请求，都 await 同一个 Promise）
        const refreshSuccess = await refreshPromise

        if (refreshSuccess) {
          // 刷新成功后，重试原请求
          // 此时 client 的 onRequest 拦截器会自动读取新的 token
          try {
            const retryResponse = await client<ApiResponse<T>>(url, options)
            if (retryResponse.code !== 200) {
              throw { message: retryResponse.message || '业务处理失败', code: retryResponse.code }
            }
            return retryResponse.data
          } catch (retryErr) {
            return handleError(retryErr)
          }
        } else {
          // 刷新失败，说明登录已经失效
          return handleError(
            { message: '登录已过期，请重新登录', code: 401 },
            requestOptions.suppressErrorToast
          )
        }
      }
    }

    // 将当前执行的 Promise 存入锁中
    const promise = execute()
    requestLocks.set(requestKey, promise)

    try {
      return await promise
    } finally {
      // 请求完成（无论成功失败），释放锁
      requestLocks.delete(requestKey)
    }
  }

  /**
   * 发送 GET 请求
   */
  function get<T>(
    url: string,
    params?: Record<string, any>,
    requestOptions?: ApiRequestOptions
  ): Promise<T> {
    return request<T>(url, { method: 'GET', params }, requestOptions)
  }

  /**
   * 发送 POST 请求
   */
  function post<T>(
    url: string,
    body?: Record<string, any>,
    requestOptions?: ApiRequestOptions
  ): Promise<T> {
    return request<T>(url, { method: 'POST', body }, requestOptions)
  }

  /**
   * 发送 PUT 请求
   */
  function put<T>(
    url: string,
    body?: Record<string, any>,
    requestOptions?: ApiRequestOptions
  ): Promise<T> {
    return request<T>(url, { method: 'PUT', body }, requestOptions)
  }

  /**
   * 发送 DELETE 请求
   */
  function del<T>(url: string, requestOptions?: ApiRequestOptions): Promise<T> {
    return request<T>(url, { method: 'DELETE' }, requestOptions)
  }

  return { get, post, put, del }
}
