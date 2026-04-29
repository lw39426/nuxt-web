import type { ThemeMode } from '~/stores/theme'

export function useThemeMode() {
  const mode = useState<ThemeMode>('themeMode', () => 'system')

  const setMode = (value: ThemeMode) => {
    mode.value = value
  }

  return {
    mode,
    setMode
  }
}
