// vitest.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 顶层 define：强制 import.meta.client=true，让 store/useApi 进入客户端分支
  define: {
    'import.meta.client': 'true',
    'import.meta.server': 'false'
  },
  resolve: {
    alias: {
      // 镜像 nuxt.config.ts 的别名，并把 ~/ 指向 Nuxt 4 的 app/ srcDir
      '@sdk': fileURLToPath(new URL('./sdk', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      // 让测试文件里用稳定的绝对路径 import 测试工具
      tests: fileURLToPath(new URL('./tests', import.meta.url)),
      // 把 Nuxt 的 #imports 虚拟模块重定向到我们的本地 stub，
      // 解决 Vitest 不运行 Nuxt 编译流程导致 #imports 无法解析的问题
      '#imports': fileURLToPath(new URL('./tests/test-utils/nuxt-imports-stub.ts', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'node', // 默认 node；组件测试通过文件顶部指令切到 happy-dom
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.{ts,vue}', 'sdk/**/*.ts'],
      exclude: ['app/**/*.d.ts', 'app/types/**', 'app/plugins/**', 'app/middleware/**'],
      // 起步阈值设低，待看到真实覆盖率后再逐步调高
      // 当前首批测试覆盖 utils/stores/composables/tracker/queue 等核心模块，
      // 整体覆盖率约 4%，后续随测试补充逐步调高阈值
      thresholds: { lines: 3, functions: 5, branches: 2, statements: 3 }
    }
  }
})
