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
  modules: ['@unocss/nuxt', '@nuxt/ui', ...(isProd ? [] : ['@nuxt/eslint'])],
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
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      useMock: process.env.NUXT_PUBLIC_USE_MOCK ? process.env.NUXT_PUBLIC_USE_MOCK === 'true' : true
    }
  },
  typescript: {
    strict: true
  },
  build: {
    transpile: ['@ai-sdk/vue']
  }
})
