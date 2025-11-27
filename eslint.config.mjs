import nuxt from '@nuxt/eslint-config'

export default nuxt(
  {},
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/html-self-closing': 'off',
      'vue/no-v-html': 'off'
    }
  }
)
