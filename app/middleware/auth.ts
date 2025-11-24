import { useAuthState } from '~/composables/useAuthState'

export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuthState()
  if (!isAuthenticated()) {
    return navigateTo('/login')
  }
})
