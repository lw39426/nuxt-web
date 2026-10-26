import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCookie } from '#imports'

export interface AuthUser {
  id: number
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  // 初始化时从 Cookie 读取（SSR 服务端读请求 Cookie，客户端读浏览器 Cookie）
  // 用户信息一并持久化，刷新页面后导航栏仍能展示正确的用户名/头像首字母
  const initAuthFromCookie = () => {
    const tokenCookie = useCookie<string | null>('auth_token')
    const refreshTokenCookie = useCookie<string | null>('refresh_token')
    const userCookie = useCookie<AuthUser | null>('auth_user')
    token.value = tokenCookie.value
    refreshToken.value = refreshTokenCookie.value
    user.value = userCookie.value ?? null
  }

  // 设置认证信息（写入内存与 Cookie）
  const setAuth = (next: {
    token?: string | null
    refreshToken?: string | null
    user?: AuthUser | null
  }) => {
    token.value = next.token ?? token.value
    refreshToken.value = next.refreshToken ?? refreshToken.value
    user.value = next.user ?? user.value

    // 写入 Cookie（自动仅在客户端执行）
    if (import.meta.client) {
      const tokenCookie = useCookie<string | null>('auth_token')
      const refreshTokenCookie = useCookie<string | null>('refresh_token')
      const userCookie = useCookie<AuthUser | null>('auth_user')
      tokenCookie.value = token.value
      refreshTokenCookie.value = refreshToken.value
      userCookie.value = user.value
    }
  }

  // 清除认证信息
  const clearAuth = () => {
    token.value = null
    refreshToken.value = null
    user.value = null

    // 清除 Cookie
    if (import.meta.client) {
      const tokenCookie = useCookie<string | null>('auth_token')
      const refreshTokenCookie = useCookie<string | null>('refresh_token')
      const userCookie = useCookie<AuthUser | null>('auth_user')
      tokenCookie.value = null
      refreshTokenCookie.value = null
      userCookie.value = null
    }
  }

  // 计算属性：是否已登录
  const isAuthenticated = computed(() => {
    return !!(token.value || refreshToken.value)
  })

  return {
    // 状态
    token,
    refreshToken,
    user,
    // 计算属性
    isAuthenticated,
    // 方法
    initAuthFromCookie,
    setAuth,
    clearAuth
  }
})
