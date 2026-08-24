# 主题 Token 速查表（Semantic Tokens Quick Reference）

**用途**：写组件样式前先查这张表，用「语义类」而不是 `bg-white dark:bg-black` 双写。
**定义位置**：`app/assets/css/theme.css`（唯一事实源）→ `uno.config.ts` `theme.colors` 映射为类名。

---

## 一、语义 token 速查表

| 语义 | CSS 变量 | 可用类（示例） | light 值 | dark 值 | 典型用途 |
|------|----------|----------------|----------|---------|----------|
| 页面底色 | `--canvas` | `bg-canvas` | `#ffffff` | `#08070f` | 页面/布局根背景 |
| 悬浮/弹层底 | `--canvas-elevated` | `bg-elevated` | `#f4f4f5` | `#1f1f23` | dropdown、hover 面板、toast |
| 卡片表面 | `--surface` | `bg-surface` | `#ffffff` | `#18181b` | 卡片 |
| 次级表面 | `--surface-muted` | `bg-surface-muted` | `#f7f7f8` | `#121417` | 输入框底、次级卡、面板轨道 |
| 毛玻璃 | `--glass-bg` | `bg-glass` | `rgba(255,255,255,.9)` | `rgba(9,9,11,.85)` | 导航栏、悬浮面板（**需搭配 `backdrop-blur`**） |
| 主文字 | `--fg` | `text-fg` | `#18181b` | `#fafafa` | 标题、正文 |
| 次级文字 | `--fg-muted` | `text-fg-muted` | `#71717a` | `#a1a1aa` | 描述、辅助文案 |
| 弱文字 | `--fg-subtle` | `text-fg-subtle` | `#a1a1aa` | `#6b6b72` | 占位符、disabled、时间戳 |
| 线框 | `--line` | `border-line` | `#e4e4e7` | `#2b2b31` | 默认边框、分隔线 |
| 强线框 | `--line-strong` | `border-line-strong` | `#d4d4d8` | `#3a3a41` | hover 边框、输入框 focus 底 |
| 品牌实底 | `--brand` | `bg-brand` / `text-brand` | `#0fba81` | `#2fd3a6` | 主按钮、品牌强调 |
| 品牌上文字 | `--on-brand` | `text-on-brand` | `#ffffff` | `#06281e` | 品牌底上的文字 |
| 品牌弱底 | `--brand-soft` | `bg-brand-soft` | `rgba(15,186,129,.12)` | `rgba(47,211,166,.12)` | 选中/悬浮底色、selection |
| 品牌 hover | `--brand-hover` | `hover:bg-brand-hover` | `#0aa374` | `#5ce6c0` | 主按钮 hover |
| 品牌 active | `--brand-active` | `active:bg-brand-active` | `#087e5c` | `#8ff2d8` | 主按钮按下 |
| 强调色 | `--accent` | `bg-accent` / `text-accent` | `#455293` | `#8b93ff` | 选中态、渐变装饰（蓝紫） |
| 强调弱底 | `--accent-soft` | `bg-accent-soft` | `rgba(69,82,147,.1)` | `rgba(139,147,255,.12)` | 强调色弱底 / 光晕背景 |
| 软阴影 | `--shadow-soft` | `shadow` 使用 var（`shadow:[var(--shadow-soft)]`） | `0 4px 24px rgba(0,0,0,.06)` | `0 4px 24px rgba(0,0,0,.4)` | 卡片/弹层阴影 |
| 遮罩 | `--overlay` | 直接 `bg-[var(--overlay)]` | `rgba(0,0,0,.4)` | `rgba(0,0,0,.6)` | 弹窗遮罩 |

## 二、品牌色阶（各主题共享）

| 变量 | 值 |
|------|-----|
| `--brand-200` | `#8ff2d8` |
| `--brand-300` | `#5ce6c0` |
| `--brand-400` | `#2fd3a6` |
| `--brand-500`（主）| `#0fba81` |
| `--brand-600` | `#0aa374` |
| `--brand-700` | `#087e5c` |

> 语义 token 通过 `var(--brand-xxx)` 引用它们；不要直接在组件里写 `bg-[#0fba81]`。

## 三、组件模式类（theme.css §4 已定义）

这些是「普通 CSS + var()」写死的组合类，直接用类名即可：

| 类名 | 做法 | 说明 |
|------|------|------|
| `read-more-btn` | 品牌实底圆角按钮 | 自带 hover/active 变体，不用补 `dark:` |
| `section-header-label/title/desc` | 模块标题规范 | 标题 `text-fg`、描述 `text-fg-muted`，label 颜色由使用处自定义 |
| `footer-title/link/desc/copy` | 页脚字体规范 | 链接自带 hover 变亮 |
| `badge-green` / `badge-gray` | 状态标签 | 语义状态色，不随主题翻转（独立类） |

## 四、使用规范

```html
<!-- ✅ 推荐：单写语义类，双主题自动适配 -->
<div class="bg-canvas text-fg border-line">…</div>
<button class="bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active">主按钮</button>
<p class="text-fg-muted">次级文字</p>
<div class="bg-glass backdrop-blur-md">毛玻璃</div>

<!-- ⛔ 禁止 -->
<div class="bg-white dark:bg-black text-gray-900 dark:text-white">…</div>
<button class="bg-brand/90">…</button>   <!-- /opacity 静默丢弃，见下 -->
```

### 铁的纪律

1. **禁止给语义色（var() 色）加 `/opacity`**：`hover:bg-brand/90` 会**静默丢弃** `/90`，生成 100% 不透明色 —— 不报错、不警告。需要透明度/交互态一律用 `-soft` / `-hover` / `-active` 变体，或直接写 `rgba()` 任意值。
   > 例外：**字面量色值**（hex/rgb，如 `bg-white/20`、`ring-black/5`）可安全使用 `/opacity`，uno 能编译期算出混色。
2. **组合类不要用 uno shortcuts**：uno 66.5.10-beta 对多段色名（`text-fg-muted`）和变体静默丢弃；且 Tailwind v4 会处理 `main.css` 的 import 链，`@apply` 引用语义类会直接构建失败。→ 组合类放 `theme.css` §4 用普通 CSS + var() 定义。
3. **新增颜色**：先在 `theme.css` 加 token（light + dark 两块），再到 `uno.config.ts` 映射（或直接定义普通 CSS 组件类）。不要在组件里写死色值。

## 五、常见配方

| 场景 | 类名 |
|------|------|
| 卡片 | `bg-surface rounded-xl border border-line` |
| 卡片 hover 提亮 | `hover:bg-surface-muted` |
| 搜索框/输入底 | `bg-surface-muted border border-line` |
| 主按钮 | `bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active` |
| 次级按钮 | `bg-surface border border-line text-fg hover:bg-surface-muted` |
| 文字按钮 | `text-fg-muted hover:text-fg` |
| 毛玻璃面板 | `bg-glass backdrop-blur-md border border-line` |
| 选中态 | `bg-brand-soft` / `bg-accent-soft` |
| 弹层/浮层 | `bg-elevated shadow-[var(--shadow-soft)]` |
| 弹窗遮罩 | `bg-[var(--overlay)]` |
| 面包屑激活 | `text-accent` / `border-accent` |
| 占位/弱文案 | `text-fg-subtle` |
| 时间戳 | `text-fg-subtle` + `text-xs` |

---

> 关联文档：《主题切换文档.md》讲机制与排查；本表解决「该写什么类」。改色 = 只改 `theme.css` 一个文件。