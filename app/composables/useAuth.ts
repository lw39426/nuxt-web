import type { ApiResponse } from '../composables/useApi'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  password: string
  confirmPassword?: string
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
   * 用户名密码登录（POST /loginByUsername）
   */
  async function loginByUsername(payload: LoginPayload): Promise<ApiResponse<AuthData>> {
    return await post<AuthData>('/loginByUsername', payload)
  }

  /**
   * 刷新 Token（POST /miniapp/user/auth/refreshToken）
   */
  async function refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return await post<{ token: string }>('/miniapp/user/auth/refreshToken')
  }

  /**
   * 退出登录（GET /miniapp/user/auth/logout）
   */
  async function logout(): Promise<ApiResponse<null>> {
    return await get<null>('/miniapp/user/auth/logout')
  }

  /**
   * 获取用户信息（GET /miniapp/user/info）
   */
  async function getUserInfo(): Promise<ApiResponse<{ id: number; username: string }>> {
    return await get<{ id: number; username: string }>('/miniapp/user/info')
  }

  /**
   * 用户注册（POST /miniapp/user/register）
   * 说明：后端未给出注册接口细节，此处先约定。
   */
  async function register(payload: RegisterPayload): Promise<ApiResponse<AuthData>> {
    return await post<AuthData>('/miniapp/user/register', payload)
  }

  return { loginByUsername, refreshToken, logout, getUserInfo, register }
}
