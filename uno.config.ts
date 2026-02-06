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
      home: {
        black: '#000000ff',
        white: '#F7F7F8',
        gray: '#666666',
        light: '#F7F7F8',
        border: '#E5E7EB',
        breadcrumb: '#a350ecff', // 面包屑默认样式 #a350ecff
        breadcrumbDark: '#8e4fc5ff', // 面包屑暗黑样式 #8e4fc5ff
        accent: '#ac6ee3ff', // 面包屑激活样式 #a350ecff
        accentDark: '#9360bfff' // 面包屑激活暗黑样式 #8e4fc5ff
      },
      mingtext: {
        dark: '#0B0C10',
        light: '#F7F7F8',
        gray: '#f1f1f1ff', // #9f9f9fff
        title: '#0B0C10',
        subtitle: '#666666'
      },
      card: {
        dark: '#121417',
        light: '#F7F7F8' // 卡片背景颜色 #F7F7F8
      }
    }
  },
  // 自定义快捷css方式
  shortcuts: {
    'section-container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    // 首页卡片背景
    'bg-dark-card': 'bg-[#121417] rounded-xl aspect-video mb-4 overflow-hidden relative',
    // 阅读更多按钮
    'read-more-btn':
      'flex items-center gap-2 px-6 py-3 text-sm font-bold text-white dark:text-black bg-home-black dark:bg-home-white/80 rounded-full hover:bg-home-accent/90',
    // 绿色标签
    'badge-green':
      'inline-block px-3 py-1 text-xs font-bold text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950 rounded-full uppercase tracking-wider',
    //灰色标签
    'badge-gray':
      'inline-block px-3 py-1 text-xs font-bold text-gray-700 bg-gray-300 dark:text-gray-700 dark:bg-gray-550 rounded-full uppercase tracking-wider'
  }
})
