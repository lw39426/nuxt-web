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
    // 全局请求拦截器：添加 Bearer Token
    onRequest({ options }) {
      const t = token.value || tokenCookie.value
      if (t) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${t}`
        } as any
      }
    },
    // 全局响应错误处理
    onResponseError({ response: _response }) {
      // 可在此做统一 401 处理（例如跳转登录或触发刷新）
    }
  })

  /**
   * 发送 GET 请求
   */
  async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await client<ApiResponse<T>>(url, { method: 'GET', params })
      if (response.code !== 200) {
        throw {
          message: response.message || '业务处理失败',
          code: response.code
        }
      }
      return response.data
    } catch (e: any) {
      const err: ApiError = {
        message: e?.data?.message || e?.message || '网络错误',
        code: e?.status || e?.code
      }
      throw err
    }
  }

  /**
   * 发送 POST 请求
   */
  async function post<T>(url: string, body?: Record<string, any>): Promise<T> {
    try {
      const response = await client<ApiResponse<T>>(url, { method: 'POST', body })
      if (response.code !== 200) {
        throw {
          message: response.message || '业务处理失败',
          code: response.code
        }
      }
      return response.data
    } catch (e: any) {
      const err: ApiError = {
        message: e?.data?.message || e?.message || '网络错误',
        code: e?.status || e?.code
      }
      throw err
    }
  }

  /**
   * 发送 PUT 请求
   */
  async function put<T>(url: string, body?: Record<string, any>): Promise<T> {
    try {
      const response = await client<ApiResponse<T>>(url, { method: 'PUT', body })
      if (response.code !== 200) {
        throw {
          message: response.message || '业务处理失败',
          code: response.code
        }
      }
      return response.data
    } catch (e: any) {
      const err: ApiError = {
        message: e?.data?.message || e?.message || '网络错误',
        code: e?.status || e?.code
      }
      throw err
    }
  }

  /**
   * 发送 DELETE 请求
   */
  async function del<T>(url: string): Promise<T> {
    try {
      const response = await client<ApiResponse<T>>(url, { method: 'DELETE' })
      if (response.code !== 200) {
        throw {
          message: response.message || '业务处理失败',
          code: response.code
        }
      }
      return response.data
    } catch (e: any) {
      const err: ApiError = {
        message: e?.data?.message || e?.message || '网络错误',
        code: e?.status || e?.code
      }
      throw err
    }
  }

  return { get, post, put, del }
}
