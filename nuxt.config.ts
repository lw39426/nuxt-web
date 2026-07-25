// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

function envNumber(key: string, fallback: number): number {
  const raw = process.env[key]
  if (!raw) return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

const trackerEndpoint = process.env.NUXT_PUBLIC_TRACKER_ENDPOINT
const trackerEnabled = process.env.NUXT_PUBLIC_TRACKER_ENABLED
  ? process.env.NUXT_PUBLIC_TRACKER_ENABLED === 'true'
  : Boolean(trackerEndpoint)

const sentryDsn = process.env.NUXT_PUBLIC_SENTRY_DSN
const sentryEnabled = process.env.NUXT_PUBLIC_SENTRY_ENABLED
  ? process.env.NUXT_PUBLIC_SENTRY_ENABLED === 'true'
  : Boolean(sentryDsn)

export default defineNuxtConfig({
  compatibilityDate: '2025-11-27',
  devtools: { enabled: !isProd },
  sourcemap: {
    client: process.env.NODE_ENV !== 'production',
    server: process.env.NODE_ENV !== 'production'
  },
  srcDir: 'app',
  css: ['~/assets/css/main.css'],
  modules: ['@unocss/nuxt', '@nuxt/ui', '@pinia/nuxt', ...(isProd ? [] : ['@nuxt/eslint'])],
  alias: {
    '@sdk': resolve(__dirname, 'sdk')
  },
  icon: {
    serverBundle: isProd
      ? {
          collections: ['carbon', 'lucide']
        }
      : 'auto'
  },
  fonts: {
    providers: {
      google: false,
      googleicons: false
    }
  },
  runtimeConfig: {
    // 仅在服务端可用 (Node.js) - Nuxt 走内网直接连 Flask，速度极快！
    // apiSecretBase: process.env.NUXT_API_SECRET_BASE || 'http://127.0.0.1:5000',
    public: {
      // 客户端与服务端均可用 - 浏览器用的地址，走 Nginx 代理
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      useMock: process.env.NUXT_PUBLIC_USE_MOCK
        ? process.env.NUXT_PUBLIC_USE_MOCK === 'true'
        : true,
      tracker: {
        enabled: trackerEnabled,
        appId: process.env.NUXT_PUBLIC_TRACKER_APP_ID || 'nuxtweb',
        endpoint: trackerEndpoint,
        debug: process.env.NUXT_PUBLIC_TRACKER_DEBUG === 'true',
        // 错误与性能建议交给 Sentry；自研 Tracker 默认不采集 error
        captureErrors: process.env.NUXT_PUBLIC_TRACKER_CAPTURE_ERRORS === 'true',
        flushIntervalMs: envNumber('NUXT_PUBLIC_TRACKER_FLUSH_INTERVAL_MS', 3000),
        batchSize: envNumber('NUXT_PUBLIC_TRACKER_BATCH_SIZE', 10),
        idleTimeoutMs: envNumber('NUXT_PUBLIC_TRACKER_IDLE_TIMEOUT_MS', 30 * 60 * 1000)
      },
      sentry: {
        enabled: sentryEnabled,
        dsn: sentryDsn,
        debug: process.env.NUXT_PUBLIC_SENTRY_DEBUG === 'true',
        tracesSampleRate: envNumber('NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE', isProd ? 0.1 : 1.0)
      }
    }
  },
  typescript: {
    strict: true
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'gsap',
        'gsap/ScrollTrigger',
        'gsap/ScrollToPlugin'
      ]
    }
  },
  build: {
    transpile: ['@ai-sdk/vue']
  }
})
