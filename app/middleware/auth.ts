import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

export default defineNuxtRouteMiddleware((_to) => {
  const authStore = useAuthStore()
  const uiStore = useUiStore()

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
