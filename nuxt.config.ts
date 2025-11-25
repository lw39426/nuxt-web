// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app',
  css: ['@unocss/reset/tailwind.css', 'element-plus/dist/index.css'],
  modules: ['@unocss/nuxt', '@nuxt/eslint'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      useMock: process.env.NUXT_PUBLIC_USE_MOCK ? process.env.NUXT_PUBLIC_USE_MOCK === 'true' : true
    }
  },
  typescript: {
    strict: true
  },
  // 解决 element-plus 和 @popperjs/core 的模块兼容性问题
  build: {
    transpile: ['element-plus', '@popperjs/core']
  }
})
