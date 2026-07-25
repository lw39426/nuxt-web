import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const publicSentry = useRuntimeConfig().public.sentry

  const enabled = Boolean(publicSentry.enabled) && Boolean(publicSentry.dsn)
  if (!enabled) {
    return {
      provide: {
        sentry: {
          captureException: () => {},
          captureMessage: () => {},
          setUser: () => {},
          setTag: () => {},
          setContext: () => {}
        } satisfies SentryApi
      }
    }
  }

  const router = useRouter()

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: publicSentry.dsn,
    debug: Boolean(publicSentry.debug) && import.meta.dev,
    environment: import.meta.dev ? 'development' : 'production',
    integrations: [
      // Vue error capturing
      Sentry.vueIntegration(),
      // Vue Router tracing for APM
      Sentry.browserTracingIntegration({ router })
    ],
    tracesSampleRate:
      typeof publicSentry.tracesSampleRate === 'number' ? publicSentry.tracesSampleRate : 0.1
  })

  const api = {
    captureException: (e: unknown) => Sentry.captureException(e),
    captureMessage: (msg: string) => Sentry.captureMessage(msg),
    setUser: (user: { id?: string; email?: string; username?: string } | null) =>
      Sentry.setUser(user),
    setTag: (key: string, value: string) => Sentry.setTag(key, value),
    setContext: (key: string, context: Record<string, any>) => Sentry.setContext(key, context)
  }

  return {
    provide: {
      sentry: api
    }
  }
})
