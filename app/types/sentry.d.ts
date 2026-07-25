interface SentryApi {
  captureException: (e: unknown) => void
  captureMessage: (msg: string) => void
  setUser: (user: { id?: string; email?: string; username?: string } | null) => void
  setTag: (key: string, value: string) => void
  setContext: (key: string, context: Record<string, any>) => void
}

declare module '#app' {
  interface NuxtApp {
    $sentry: SentryApi
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $sentry: SentryApi
  }
}

export {}
