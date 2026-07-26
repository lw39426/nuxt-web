/** 微信登录请求体 */
export interface WxLoginPayload {
  code: string
  nickname?: string
  avatar?: string
}

/** 手机号登录请求体 */
export interface PhoneLoginPayload {
  phone: string
  code: string
}

/** 用户名登录请求体 */
export interface UsernameLoginPayload {
  username: string
  password: string
}

/** 注册请求体 */
export interface RegisterPayload {
  username: string
  password: string
  phone?: string
  code?: string
}

/** 登录响应数据 */
export interface AuthTokenData {
  access_token: string
  refresh_token: string
  user: {
    id: number
    username: string
    nickname?: string
    avatar?: string
  }
}

/**
 * 认证模块 API 封装
 * 前缀: /auth
 * 无鉴权要求（logout 除外）
 */
export function useAuth() {
  const { get, post } = useApi()

  /**
   * 微信登录
   * POST /auth/wxLogin
   */
  async function wxLogin(payload: WxLoginPayload): Promise<AuthTokenData> {
    return await post<AuthTokenData>('/auth/wxLogin', payload, { suppressErrorToast: true })
  }

  /**
   * 手机号登录
   * POST /auth/loginByPhone
   */
  async function loginByPhone(payload: PhoneLoginPayload): Promise<AuthTokenData> {
    return await post<AuthTokenData>('/auth/loginByPhone', payload, { suppressErrorToast: true })
  }

  /**
   * 用户名密码登录
   * POST /auth/loginByUsername
   */
  async function loginByUsername(payload: UsernameLoginPayload): Promise<AuthTokenData> {
    return await post<AuthTokenData>('/auth/loginByUsername', payload, { suppressErrorToast: true })
  }

  /**
   * 通用登录（根据请求体字段自动识别登录方式）
   * POST /auth/login
   */
  async function login(payload: Record<string, any>): Promise<AuthTokenData> {
    return await post<AuthTokenData>('/auth/login', payload, { suppressErrorToast: true })
  }

  /**
   * 用户注册
   * POST /auth/register
   */
  async function register(payload: RegisterPayload): Promise<AuthTokenData> {
    return await post<AuthTokenData>('/auth/register', payload, { suppressErrorToast: true })
  }

  /**
   * 刷新 Token
   * POST /auth/refreshToken
   * 注意：此方法一般由 useApi 内部自动调用，也可手动调用
   */
  async function refreshToken(): Promise<{ access_token: string }> {
    return await post<{ access_token: string }>('/auth/refreshToken')
  }

  /**
   * 退出登录
   * GET /auth/logout
   * 需要鉴权
   */
  async function logout(): Promise<null> {
    return await get<null>('/auth/logout')
  }

  /**
   * 获取验证码
   * GET /auth/getCode?phone=xxx
   * phone 可选，不传时获取图形验证码
   */
  async function getCode(phone?: string): Promise<any> {
    return await get<any>('/auth/getCode', phone ? { phone } : undefined)
  }

  /**
   * 获取用户信息
   * GET /user/info
   */
  async function getUserInfo() {
    return await get<{
      id: number
      username: string
      nickname: string
      phone: string
      avatar: string
    }>('/user/info')
  }

  return {
    wxLogin,
    loginByPhone,
    loginByUsername,
    login,
    register,
    refreshToken,
    logout,
    getCode,
    getUserInfo
  }
}
