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

// 站点正式域名（SEO 相关绝对 URL 的唯一来源）：
// - 线上部署：通过环境变量 NUXT_PUBLIC_SITE_URL 注入真实域名
// - 未配置时使用占位域名，避免 sitemap / canonical 生成失败
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://www.lyoo.cloud'

// 站点默认描述（作为全站 title/description 兜底，可被单页 useSeoMeta 覆盖）
const siteDescription =
  'YouMi 角色百科，面向动漫与影视爱好者的角色图鉴平台，收录海量角色档案、能力设定与人物关系，并提供 AI 角色问答与角色对比。'

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
  modules: [
    '@unocss/nuxt',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/seo',
    ...(isProd ? [] : ['@nuxt/eslint'])
  ],
  alias: {
    '@sdk': resolve(__dirname, 'sdk')
  },
  // ==================== SEO：站点信息 ====================
  // @nuxtjs/seo 以此为唯一数据源生成 canonical / og:url / sitemap 等绝对 URL
  site: {
    url: siteUrl,
    name: 'YouMi 角色百科',
    description: siteDescription,
    defaultLocale: 'zh-CN'
  },
  // ==================== SEO：sitemap ====================
  sitemap: {
    // 动态 URL 数据源：角色详情页 + 文章详情页（见 server/api/__sitemap__/urls.ts）
    sources: ['/api/__sitemap__/urls'],
    // 排除无需收录的低价值 / 私有路由
    exclude: [
      '/profile',
      '/profile/**',
      '/ai-page',
      '/search',
      '/compare',
      '/navbar-60fps-test',
      '/_about',
      '/privacy',
      '/terms',
      '/disclaimer'
    ],
    // 动态详情页数量增长较快，按 1000 条分片
    defaultSitemapsChunkSize: 1000
  },
  // ==================== SEO：robots ====================
  robots: {
    // 自动把 sitemap 地址写入 robots.txt
    sitemap: [`${siteUrl}/sitemap.xml`],
    // 私有区域禁止抓取
    disallow: ['/profile', '/profile/', '/api/'],
    // 若存在 public/robots.txt 则自动合并其中的自定义规则（当前无该文件，仅保留扩展点）
    mergeWithRobotsTxtPath: true
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      },
      // apple-touch-icon：iOS Safari 里把网页"添加到主屏幕"时，使用的图标
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon.svg'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/images/logo/youmi-hand-color-square-32.png'
        },
        {
          rel: 'apple-touch-icon',
          href: '/images/logo/youmi-hand-color-square-32.png'
        }
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        // 全站默认描述：单页未设置 description 时兜底，避免出现空描述
        { name: 'description', content: siteDescription },
        { name: 'format-detection', content: 'telephone=no' }
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
    // 仅服务端可用：后端地址（含路由前缀），BFF 层直连
    // - 本地: http://127.0.0.1:5050/api/v1（直连 Flask）
    // - 线上: http://127.0.0.1:5050/api/v1（服务器回环地址直连 Flask）
    apiSecretBase: process.env.NUXT_API_SECRET_BASE || 'http://127.0.0.1:5050/api/v1',
    // 仅服务端可用：BFF 请求 Flask 的超时时间（毫秒）
    apiTimeout: envNumber('NUXT_API_TIMEOUT', 8000),
    public: {
      // 站点正式域名（供客户端读取，与 site.url 保持同源）
      siteUrl,
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
    },
    // 私有页面：禁止搜索引擎索引（X-Robots-Tag + meta robots）
    // 等价于输出 <meta name="robots" content="noindex, nofollow"> 和 X-Robots-Tag 响应头
    '/profile': {
      robots: false
    },
    '/profile/**': {
      robots: false
    },
    '/ai-page': {
      robots: false
    },
    '/search': {
      robots: false
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
