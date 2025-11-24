export interface AuthUser {
  id: number
  username: string
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
}

/**
 * 提供全局认证状态读写（无 Pinia，使用 Nuxt useState）
 */
export function useAuthState() {
  const token = useState<string | null>('auth_token', () => null)
  const user = useState<AuthUser | null>('auth_user', () => null)
  const tokenCookie = useCookie<string | null>('auth_token')

  /**
   * 设置认证信息（写入内存与 Cookie）
   */
  function setAuth(next: AuthState) {
    token.value = next.token || null
    user.value = next.user || null
    tokenCookie.value = next.token || null
  }

  /**
   * 清除认证信息
   */
  function clearAuth() {
    token.value = null
    user.value = null
    tokenCookie.value = null
  }

  /**
   * 是否已登录
   */
  function isAuthenticated() {
    return !!(token.value || tokenCookie.value)
  }

  return { token, user, setAuth, clearAuth, isAuthenticated }
}
