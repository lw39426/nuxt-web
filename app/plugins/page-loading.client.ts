import type { RouteLocationNormalizedLoaded } from 'vue-router'

export default defineNuxtPlugin((nuxtApp) => {
  // 初始为 false：SSR 首屏内容已由服务端渲染，水合后无需再显示全屏遮罩
  const globalPageLoading = useState<boolean>('globalPageLoading', () => false)
  const indicator = useLoadingIndicator({ duration: 1800, throttle: 80 })
  const router = useRouter()
  const FULLSCREEN_MIN_VISIBLE = 180

  let hideTimer: ReturnType<typeof setTimeout> | null = null
  let watchdogTimer: ReturnType<typeof setTimeout> | null = null
  let shownAt = 0
  // 首次进入页面（SSR 首屏）不显示全屏遮罩，仅在路由切换时显示
  let shouldShowFullscreen = false
  // let shouldShowFullscreen = true

  const isSoftNavigation = (
    to: RouteLocationNormalizedLoaded,
    from: RouteLocationNormalizedLoaded
  ) => {
    if (!from.name) return false
    if (to.matched.length !== from.matched.length) return false

    // 父级布局记录一致即视为软导航，嵌套路由内切换子页（如 /profile/account ↔ /profile/orders）
    // 不会弹全屏遮罩；跨布局的导航仍按硬导航处理
    return to.matched[0]?.path === from.matched[0]?.path
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
    // 首次导航（from 为空，即 SSR 首屏）不显示全屏遮罩，避免水合等待感
    shouldShowFullscreen = !!from.name && !isSoftNavigation(to, from)
    // shouldShowFullscreen = !isSoftNavigation(to, from)
  })

  startLoading()

  nuxtApp.hook('page:start', startLoading)
  nuxtApp.hook('page:finish', () => stopLoading(120))
  nuxtApp.hook('app:error', () => stopLoading(0))

  onNuxtReady(() => {
    stopLoading(200)
  })
})
