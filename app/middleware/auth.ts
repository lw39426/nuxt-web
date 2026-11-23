import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

/** 恢复真实登录态并校验受保护页面，未登录时进入现有登录流程。 */
export default defineNuxtRouteMiddleware(() => {
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
