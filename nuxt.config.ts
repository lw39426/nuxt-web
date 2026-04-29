// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === 'production'

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
      useMock: process.env.NUXT_PUBLIC_USE_MOCK ? process.env.NUXT_PUBLIC_USE_MOCK === 'true' : true
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
