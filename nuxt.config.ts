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
  colorMode: {
    preference: 'system',
    fallback: 'light',
    storageKey: 'nuxt-color-mode',
    classSuffix: '',
    disableTransition: true
  },
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
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: ''
        }
      ]
    }
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
    // 仅服务端可用：Flask 后端地址，BFF 层内网直连
    apiSecretBase: process.env.NUXT_API_SECRET_BASE || 'http://127.0.0.1:5050',
    // 仅服务端可用：BFF 请求 Flask 的超时时间（毫秒）
    apiTimeout: envNumber('NUXT_API_TIMEOUT', 8000),
    public: {
      // 是否启用 Mock 模式（true=强制 Mock，false=优先调 Flask 并在失败时降级）
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
  nitro: {
    // 生产环境对静态资源启用 gzip/brotli 预压缩，减小传输体积
    compressPublicAssets: isProd ? { gzip: true, brotli: true } : false
  },
  routeRules: {
    // 静态图片资源：长缓存（图片内容一经发布不再变更）
    '/products/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
    '/articles/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
    '/images/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
    '/avatar.webp': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    },
    // 首页聚合数据：1 分钟 SWR 缓存，降低后端压力并加速返回
    '/api/v1/home/data': {
      cache: { maxAge: 60, staleMaxAge: 600, swr: true }
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'gsap',
        'gsap/ScrollTrigger',
        'gsap/ScrollToPlugin',
        'reka-ui',
        '@nuxt/ui',
        '@vueuse/core',
        '@popperjs/core'
      ]
    },
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true
    }
  },
  build: {
    transpile: ['@ai-sdk/vue']
  }
})
