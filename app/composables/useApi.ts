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

/**
 * 创建通用的 API 客户端，自动附加 baseURL、凭据与 Bearer Token
 */
export function useApi() {
  const {
    public: { apiBase }
  } = useRuntimeConfig()
  const { token } = useAuthState()
  const tokenCookie = useCookie<string | null>('auth_token')

  const client = $fetch.create({
    baseURL: apiBase,
    credentials: 'include',
    onRequest({ options }) {
      const t = token.value || tokenCookie.value
      if (t) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${t}`
        }
      }
    },
    onResponseError({ response: _response }) {
      // 可在此做统一 401 处理（例如跳转登录或触发刷新）
    }
  })

  /**
   * 发送 GET 请求
   */
  async function get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      return await client<ApiResponse<T>>(url, { method: 'GET', params })
    } catch (e: any) {
      const err: ApiError = {
        message: e?.data?.message || e?.message || '网络错误',
        code: e?.status
      }
      throw err
    }
  }

  /**
   * 发送 POST 请求
   */
  async function post<T>(url: string, body?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      return await client<ApiResponse<T>>(url, { method: 'POST', body })
    } catch (e: any) {
      const err: ApiError = {
        message: e?.data?.message || e?.message || '网络错误',
        code: e?.status
      }
      throw err
    }
  }

  /**
   * 发送 PUT 请求
   */
  async function put<T>(url: string, body?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      return await client<ApiResponse<T>>(url, { method: 'PUT', body })
    } catch (e: any) {
      const err: ApiError = {
        message: e?.data?.message || e?.message || '网络错误',
        code: e?.status
      }
      throw err
    }
  }

  /**
   * 发送 DELETE 请求
   */
  async function del<T>(url: string): Promise<ApiResponse<T>> {
    try {
      return await client<ApiResponse<T>>(url, { method: 'DELETE' })
    } catch (e: any) {
      const err: ApiError = {
        message: e?.data?.message || e?.message || '网络错误',
        code: e?.status
      }
      throw err
    }
  }

  return { get, post, put, del }
}
