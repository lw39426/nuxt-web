import type { AuthUser } from '~/stores/auth'

export interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
}

/**
 * 提供全局认证状态读写（无 Pinia，使用 Nuxt useState）
 */
export function useAuthState() {
  const token = useState<string | null>('auth_token', () => null)
  const refreshToken = useState<string | null>('refresh_token', () => null)
  const user = useState<AuthUser | null>('auth_user', () => null)
  const tokenCookie = useCookie<string | null>('auth_token')
  const refreshTokenCookie = useCookie<string | null>('refresh_token')

  /**
   * 设置认证信息（写入内存与 Cookie）
   */
  function setAuth(next: AuthState) {
    token.value = next.token || null
    refreshToken.value = next.refreshToken || null
    user.value = next.user || null
    tokenCookie.value = next.token || null
    refreshTokenCookie.value = next.refreshToken || null
  }

  /**
   * 清除认证信息
   */
  function clearAuth() {
    token.value = null
    refreshToken.value = null
    user.value = null
    tokenCookie.value = null
    refreshTokenCookie.value = null
  }

  /**
   * 是否已登录
   */
  function isAuthenticated() {
    return !!(token.value || tokenCookie.value)
  }

  return { token, user, setAuth, clearAuth, isAuthenticated }
}
