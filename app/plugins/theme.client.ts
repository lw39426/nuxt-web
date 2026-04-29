import type { ThemeMode } from '~/stores/theme'
import { useThemeStore } from '~/stores/theme'

const STORAGE_KEY = 'theme-mode'

function parseMode(value: string | null): ThemeMode | null {
  if (value === 'system' || value === 'light' || value === 'dark') return value
  return null
}

export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()

  const setDarkClass = (isDark: boolean) => {
    document.documentElement.classList.toggle('dark', isDark)
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  let listening = false

  const onMediaChange = (e: MediaQueryListEvent) => {
    if (themeStore.mode === 'system') setDarkClass(e.matches)
  }

  const syncMediaListener = () => {
    if (themeStore.mode === 'system') {
      if (listening) return
      media.addEventListener?.('change', onMediaChange)
      media.addListener?.(onMediaChange)
      listening = true
      return
    }

    if (!listening) return
    media.removeEventListener?.('change', onMediaChange)
    media.removeListener?.(onMediaChange)
    listening = false
  }

  const apply = () => {
    if (themeStore.mode === 'dark') return setDarkClass(true)
    if (themeStore.mode === 'light') return setDarkClass(false)
    return setDarkClass(media.matches)
  }

  try {
    const stored = parseMode(localStorage.getItem(STORAGE_KEY))
    if (stored) themeStore.setMode(stored)
  } catch {
    // ignore storage failures (e.g. privacy mode)
  }

  watch(
    () => themeStore.mode,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, value)
      } catch {
        // ignore
      }
      syncMediaListener()
      apply()
    },
    { immediate: true }
  )
})
