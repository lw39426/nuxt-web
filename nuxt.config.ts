// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-11-27',
  devtools: { enabled: true },
  srcDir: 'app',
  css: ['@unocss/reset/tailwind.css', '~/assets/css/main.css'],
  modules: ['@unocss/nuxt', '@nuxt/eslint', '@nuxt/ui'],
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
  }
})
