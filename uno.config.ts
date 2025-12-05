import type { IconifyJSON } from '@iconify/types'
import {
  defineConfig,
  presetWind3,
  presetAttributify,
  presetIcons,
  transformerDirectives
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        carbon: async (): Promise<IconifyJSON> => {
          const i = await import('@iconify-json/carbon/icons.json')
          return i.default as any as IconifyJSON
        },
        lucide: async (): Promise<IconifyJSON> => {
          const i = await import('@iconify-json/lucide/icons.json')
          return i.default as any as IconifyJSON
        }
      }
    })
  ],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      brand: {
        black: '#0B0C10',
        gray: '#666666',
        light: '#F7F7F8',
        border: '#E5E7EB',
        accent: '#0D9488'
      },
      mint: {
        50: '#effcf6',
        100: '#dff8ec',
        500: '#0fba81',
        600: '#0d946b',
        900: '#064e3b'
      },
      dark: {
        bg: '#020305',
        card: '#121417'
      }
    }
  },
  shortcuts: {
    'section-container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    'badge-green':
      'inline-block px-3 py-1 text-xs font-bold text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950 rounded-full uppercase tracking-wider'
  }
})
