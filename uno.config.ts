import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  presetWebFonts
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({ scale: 1.2 }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Inter:400,500,600,700' // Mintlify 标志性的干净字体
      }
    })
  ],
  transformers: [
    transformerDirectives() // 启用 @apply 等指令
  ],
  theme: {
    colors: {
      brand: {
        black: '#0B0C10',
        gray: '#666666',
        light: '#F7F7F8',
        border: '#E5E7EB',
        accent: '#0D9488' // 类似于设计稿中的青色/绿色标签
      },
      mint: {
        50: '#effcf6',
        100: '#dff8ec',
        500: '#0fba81', // Mintlify 标志性绿色
        600: '#0d946b',
        900: '#064e3b'
      },
      dark: {
        bg: '#020305', // 企业版块深色背景
        card: '#121417'
      }
    },
    borderRadius: {
      sm: '6px',
      md: '10px',
      lg: '14px'
    },
    boxShadow: {
      // card: '0 6px 24px rgba(0,0,0,0.06)',
      hero: '0 20px 60px -10px rgba(0, 0, 0, 0.1)', // 英雄区截图的阴影
      card: '0 4px 20px -4px rgba(0, 0, 0, 0.05)' // 卡片阴影
    }
  },
  shortcuts: {
    btn: 'px-3 py-2 rounded-md bg-brand-primary text-white hover:bg-#2563eb transition',
    'btn-outline': 'px-3 py-2 rounded-md border border-#e5e7eb hover:bg-#f9fafb transition',
    'section-container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    card: 'rounded-md shadow-card bg-white',
    // 常用工具类
    'flex-center': 'flex items-center justify-center',
    'text-gradient': 'bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500',
    'btn-primary':
      'px-6 py-2.5 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400 transition shadow-[0_0_20px_-5px_rgba(34,197,94,0.6)]',
    'btn-dark':
      'bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-900 transition text-sm',
    'btn-secondary':
      'px-6 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-white font-medium backdrop-blur-sm',
    'card-glass': 'bg-brand-surface/50 border border-brand-border backdrop-blur-md rounded-2xl'
  },
  // 自定义 CSS 规则用于网格背景
  rules: [
    [
      'bg-grid-pattern',
      {
        'background-image': `linear-gradient(to right, #222 1px, transparent 1px),
                           linear-gradient(to bottom, #222 1px, transparent 1px)`,
        'background-size': '40px 40px'
      }
    ]
  ]
})
