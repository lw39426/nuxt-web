import { BrowserNetworkAdapter, createBrowserStorageAdapters, Tracker } from '@sdk/tracker'
import type { EventParams, TrackResult } from '@sdk/tracker'

type TrackExposeBindingValue =
  | string
  | {
      eventName: string
      params?: EventParams
      once?: boolean
      threshold?: number | number[]
      rootMargin?: string
    }

const exposeObservers = new WeakMap<Element, IntersectionObserver>()

function normalizeExposeValue(value: TrackExposeBindingValue | undefined) {
  if (!value) return { eventName: 'expose' as const }
  if (typeof value === 'string') return { eventName: value }
  return value
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const publicConfig = useRuntimeConfig().public.tracker

  const sentry = nuxtApp.$sentry as SentryApi | undefined

  const endpoint = publicConfig.endpoint || ''
  const enabled = Boolean(publicConfig.enabled) && Boolean(endpoint)
  const debug = Boolean(publicConfig.debug) && import.meta.dev
  const appId = publicConfig.appId || 'nuxtweb'

  const { local, session } = createBrowserStorageAdapters()
  const network = new BrowserNetworkAdapter({ credentials: 'omit' })

  const tracker = new Tracker(
    {
      appId,
      endpoint,
      enabled,
      debug,
      flushIntervalMs: publicConfig.flushIntervalMs,
      batchSize: publicConfig.batchSize,
      idleTimeoutMs: publicConfig.idleTimeoutMs,
      platform: 'web',
      env: import.meta.dev ? 'dev' : 'prod',
      enrich: () => ({
        url: typeof location !== 'undefined' ? location.href : undefined
      })
    },
    {
      deviceStorage: local,
      sessionStorage: session,
      network
    }
  )

  await tracker.init()

  // If Sentry is enabled, enrich it with tracker identifiers for correlation.
  if (sentry?.setTag) {
    const deviceId = tracker.getDeviceId()
    const sessionId = tracker.getSessionId()
    if (deviceId) sentry.setTag('device_id', deviceId)
    if (sessionId) sentry.setTag('session_id', sessionId)
    sentry.setTag('app_id', appId)
  }

  // -------- Auto PV (page_view) --------
  const router = useRouter()
  let lastUrl: string | undefined

  const trackPageView = () => {
    if (!enabled) return
    const url = location.href
    const referrer = lastUrl ?? document.referrer ?? undefined

    tracker.setPrevUrl(lastUrl)
    tracker.track('page_view', {
      url,
      referrer,
      params: {
        path: router.currentRoute.value.fullPath,
        title: document.title
      }
    })
    lastUrl = url
  }

  nuxtApp.hook('page:finish', trackPageView)

  // -------- Auto Error --------
  // 默认：错误与 APM 交给 Sentry（避免自研后端错误监控系统）
  // 如果确实需要把 error 也打到自研行为平台，可通过 tracker.captureErrors 显式开启。
  if (enabled && publicConfig.captureErrors) {
    const reportError = (source: string, payload: Record<string, unknown>) => {
      tracker.track('error', {
        url: location.href,
        params: {
          source,
          ...payload
        }
      })
    }
    // 备份保留 Vue 错误处理器链，避免干扰 Sentry 等其他错误监控工具
    const prevVueErrorHandler = nuxtApp.vueApp.config.errorHandler
    nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
      const anyErr = err as any
      reportError('vue', {
        message: anyErr?.message ?? String(err),
        stack: anyErr?.stack,
        info
      })
      prevVueErrorHandler?.(err, instance, info)
    }

    window.addEventListener(
      'error',
      (event: Event) => {
        if (!(event instanceof ErrorEvent)) {
          const target = event.target as HTMLElement | null
          const tagName = target?.tagName
          // @ts-expect-error - src/href depends on element type
          const url = (target && (target.src || target.href)) as string | undefined
          reportError('resource', { tagName, url })
          return
        }

        reportError('window', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        })
      },
      true
    )

    window.addEventListener('unhandledrejection', (event) => {
      const reason: any = event.reason
      reportError('unhandledrejection', {
        message: reason?.message ?? String(reason),
        stack: reason?.stack
      })
    })
  }

  // -------- Flush on close/hide (sendBeacon preferred) --------
  const flushOnHide = () => {
    if (!enabled) return
    if (document.visibilityState === 'hidden') void tracker.flushOnClose()
  }
  document.addEventListener('visibilitychange', flushOnHide, { passive: true })
  window.addEventListener('pagehide', () => {
    if (!enabled) return
    void tracker.flushOnClose()
  })

  // -------- v-track-expose (IntersectionObserver) --------
  nuxtApp.vueApp.directive('track-expose', {
    mounted(el, binding) {
      if (!enabled) return
      if (typeof IntersectionObserver === 'undefined') return

      const value = normalizeExposeValue(binding.value as TrackExposeBindingValue)
      const eventName = value.eventName
      const params = 'params' in value ? value.params : undefined
      const once = 'once' in value ? (value.once ?? true) : true
      const threshold = 'threshold' in value ? (value.threshold ?? 0.5) : 0.5
      const rootMargin = 'rootMargin' in value ? (value.rootMargin ?? '0px') : '0px'

      let fired = false
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            if (once && fired) return
            fired = true
            tracker.track('expose', {
              event_name: eventName,
              params
            })
            if (once) observer.unobserve(el)
          }
        },
        { threshold, rootMargin }
      )
      exposeObservers.set(el, observer)
      observer.observe(el)
    },
    unmounted(el) {
      const observer = exposeObservers.get(el)
      if (observer) observer.disconnect()
      exposeObservers.delete(el)
    }
  })

  // -------- Business API --------
  const $track = (eventName: string, params?: EventParams): TrackResult => {
    if (!enabled) return { enqueued: false, dropped: true, reason: 'disabled' }
    tracker.setPrevUrl(lastUrl)
    return tracker.track('click', {
      event_name: eventName,
      params
    })
  }

  return {
    provide: {
      track: $track
    }
  }
})
