import type { RouteLocationNormalizedLoaded } from 'vue-router'

export default defineNuxtPlugin((nuxtApp) => {
  const globalPageLoading = useState<boolean>('globalPageLoading', () => true)
  const indicator = useLoadingIndicator({ duration: 1800, throttle: 80 })
  const router = useRouter()
  const FULLSCREEN_MIN_VISIBLE = 180

  let hideTimer: ReturnType<typeof setTimeout> | null = null
  let watchdogTimer: ReturnType<typeof setTimeout> | null = null
  let shownAt = 0
  let shouldShowFullscreen = true

  const isSoftNavigation = (
    to: RouteLocationNormalizedLoaded,
    from: RouteLocationNormalizedLoaded
  ) => {
    if (!from.name) return false
    if (to.matched.length !== from.matched.length) return false

    // Same matched records means only params/query/hash changed on the same page component.
    return to.matched.every((record, index) => record.path === from.matched[index]?.path)
  }

  const clearTimers = () => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    if (watchdogTimer) {
      clearTimeout(watchdogTimer)
      watchdogTimer = null
    }
  }

  const startLoading = () => {
    clearTimers()

    if (shouldShowFullscreen) {
      globalPageLoading.value = true
      shownAt = Date.now()
    }

    indicator.start()

    // Fallback: avoid a permanent white screen if a route hook never settles.
    watchdogTimer = setTimeout(() => {
      globalPageLoading.value = false
      indicator.finish()
    }, 12000)
  }

  const stopLoading = (delay = 120) => {
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      const hide = () => {
        globalPageLoading.value = false
        indicator.finish()
      }

      if (!globalPageLoading.value) {
        hide()
      } else {
        const visibleMs = Date.now() - shownAt
        const extraDelay = Math.max(0, FULLSCREEN_MIN_VISIBLE - visibleMs)
        setTimeout(hide, extraDelay)
      }

      if (watchdogTimer) {
        clearTimeout(watchdogTimer)
        watchdogTimer = null
      }
    }, delay)
  }

  router.beforeEach((to, from) => {
    shouldShowFullscreen = !isSoftNavigation(to, from)
  })

  startLoading()

  nuxtApp.hook('page:start', startLoading)
  nuxtApp.hook('page:finish', () => stopLoading(120))
  nuxtApp.hook('app:error', () => stopLoading(0))

  onNuxtReady(() => {
    stopLoading(200)
  })
})
