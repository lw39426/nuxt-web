import { defineStore } from 'pinia'

export type ThemeMode = 'system' | 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('system')

  const setMode = (value: ThemeMode) => {
    mode.value = value
  }

  return {
    mode,
    setMode
  }
})
