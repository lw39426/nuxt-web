import nuxt from '@nuxt/eslint-config'
import prettier from 'eslint-plugin-prettier'

export default nuxt(
  {},
  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/html-self-closing': 'off',
      'vue/no-v-html': 'off'
    }
  }
)
