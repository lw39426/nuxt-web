import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

export default defineNuxtRouteMiddleware((_to) => {
  const authStore = useAuthStore()
  const uiStore = useUiStore()

  // 中间件可能在 app.vue setup 之前执行（服务端），需在此从 Cookie 恢复登录态
  authStore.initAuthFromCookie()

  if (!authStore.isAuthenticated) {
    if (import.meta.client) {
      uiStore.openAuthModal('login')
      return abortNavigation()
    }
    return navigateTo({
      path: '/',
      query: { authModal: 'login' }
    })
  }
})
