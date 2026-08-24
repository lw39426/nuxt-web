declare module 'nuxt/schema' {
  interface RuntimeConfig {
    apiSecretBase: string
    apiTimeout: number
  }

  interface PublicRuntimeConfig {
    useMock: boolean
    tracker: {
      enabled: boolean
      appId: string
      endpoint: string
      debug: boolean
      captureErrors: boolean
      flushIntervalMs: number
      batchSize: number
      idleTimeoutMs: number
    }
    sentry: {
      enabled: boolean
      dsn: string
      debug: boolean
      tracesSampleRate: number
    }
  }
}

export {}
