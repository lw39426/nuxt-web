export interface LoginPayload {
  username?: string
  phone?: string
  password?: string
  captcha?: string
  captcha_key?: string
}

export interface RegisterPayload {
  username?: string
  phone?: string
  password?: string
  nickname?: string
  captcha?: string
  captcha_key?: string
}

export interface AuthData {
  token: string
  user: {
    id: number
    username: string
  }
}

/**
 * 认证相关 API 封装，适配 Bearer Token 与后端路径
 */
export function useAuth() {
  const { get, post } = useApi()

  /**
   * 用户名密码登录（POST /auth/loginByUsername）
   */
  async function loginByUsername(
    payload: LoginPayload
  ): Promise<{ access_token: string; refresh_token: string }> {
    return await post<{ access_token: string; refresh_token: string }>(
      '/auth/loginByUsername',
      payload,
      { suppressErrorToast: true }
    )
  }

  /**
   * 获取验证码（GET /auth/getCode）
   */
  async function getCode(): Promise<{ captcha_key: string; image: string }> {
    return await get<{ captcha_key: string; image: string }>('/auth/getCode')
  }

  /**
   * 刷新 Token（POST /auth/refreshToken）
   */
  async function refreshToken(): Promise<{ access_token: string }> {
    return await post<{ access_token: string }>('/auth/refreshToken')
  }

  /**
   * 退出登录（GET /auth/logout）
   */
  async function logout(): Promise<null> {
    return await get<null>('/auth/logout')
  }

  /**
   * 获取用户信息（GET /user/info）
   */
  async function getUserInfo(): Promise<{ id: number; username: string }> {
    return await get<{ id: number; username: string }>('/user/info')
  }

  /**
   * 用户注册（POST /auth/register）
   */
  async function register(payload: RegisterPayload): Promise<any> {
    return await post<any>('/auth/register', payload, { suppressErrorToast: true })
  }

  return { loginByUsername, getCode, refreshToken, logout, getUserInfo, register }
}
