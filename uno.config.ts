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
      // ============================================================
      // 语义色板：值来自 app/assets/css/theme.css 的 CSS 变量
      // .dark 出现时代理值自动翻转，组件写 bg-surface 即可双主题适配，
      // 生成类名：
      //   bg-canvas / bg-surface / bg-elevated / bg-surface-muted / bg-glass
      //   text-fg / text-fg-muted / text-fg-subtle
      //   border-line / border-line-strong
      //   bg-brand / text-brand / bg-brand-soft / text-on-brand
      //   hover:bg-brand-hover / active:bg-brand-active
      //   bg-accent / text-accent / bg-accent-soft
      // 注意：这些 token 不支持 /opacity 修饰符；实测 bg-brand/90 会"静默丢弃 /90"
      // 生成 100% 不透明，极易踩坑。需要透明度/交互态请用 -soft/-hover/-active 变体
      // 完整速查表见 docs/tokens.md
      // ============================================================
      canvas: 'var(--canvas)',
      elevated: 'var(--canvas-elevated)',
      surface: 'var(--surface)',
      surfaceMuted: 'var(--surface-muted)',
      glass: 'var(--glass-bg)',
      fg: 'var(--fg)',
      fgMuted: 'var(--fg-muted)',
      fgSubtle: 'var(--fg-subtle)',
      line: 'var(--line)',
      lineStrong: 'var(--line-strong)',
      brand: 'var(--brand)',
      brandSoft: 'var(--brand-soft)',
      brandHover: 'var(--brand-hover)',
      brandActive: 'var(--brand-active)',
      onBrand: 'var(--on-brand)',
      accent: 'var(--accent)',
      accentSoft: 'var(--accent-soft)',
      // 淡紫按钮（light purple button）
      btnLpurple: 'var(--btn-lpurple)',
      btnLpurpleText: 'var(--btn-lpurple-text)',
      btnLpurpleHover: 'var(--btn-lpurple-hover)'
    }
  },
  // 自定义快捷css方式
  // 注意：带颜色/交互态（hover: 等）的组合类请直接写到 app/assets/css/theme.css
  // 用普通 CSS + var() 引用语义 token 定义，不要在这里用 uno shortcuts / CSS @apply 引用语义类：
  //   - uno shortcuts 解析对"多段颜色名"（如 text-fg-muted）和变体存在静默丢弃 bug（66.5.10-beta）
  //   - Tailwind v4 vite 插件会处理 main.css 的 import 链，@apply 引用 UnoCSS 语义类会直接构建失败
  shortcuts: {
    'section-container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
  }
})
