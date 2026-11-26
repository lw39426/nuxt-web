import { defineConfig } from 'vitest/config'
import config from '../vitest.config'

export default defineConfig({
  ...config,
  define: {
    ...config.define,
    'import.meta.client': 'false',
    'import.meta.server': 'true'
  },
  test: {
    ...config.test,
    include: ['tests/unit/composables/useApi.ssr.spec.ts']
  }
})
