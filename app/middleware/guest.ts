import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  // 中间件可能在 app.vue setup 之前执行（服务端），需在此从 Cookie 恢复登录态
  authStore.initAuthFromCookie()
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
