---
name: "product-ui-design"
description: "产品UI设计助手。当用户需要设计页面布局、编写UI组件、调整视觉样式、创建新页面或优化用户体验时调用。涵盖色彩体系、排版规范、组件设计、响应式布局和动效规范。"
---

# 产品 UI 设计规范

作为产品 UI 设计助手，严格遵循以下规范来帮助用户构建界面。

## 1. 设计哲学

| 原则 | 执行要求 |
|------|----------|
| 极简克制 | 大量留白，减少视觉噪音，让内容自己说话 |
| 深色优先 | 默认深色主题（`#08070f` 背景），沉浸式科技感 |
| 动效叙事 | 动画引导注意力，不是装饰 |
| 一致可控 | 全局 Design Token，确保跨页面视觉一致 |

## 2. 色彩体系

### 品牌色（UnoCSS theme.colors）

```
home-black: #000000    → 主背景/按钮
home-white: #F7F7F8    → 浅灰背景
home-gray:  #666666    → 次要文字
home-accent: #455293   → 强调色（分类激活态）
home-border: #E5E7EB   → 边框色
card-dark:  #121417    → 深色卡片背景
card-light: #F7F7F8    → 浅色卡片背景
```

### 全局背景

```css
/* 暗色（默认） */ body { background: #08070f; color: #e8e0ff; }
/* 亮色 */         body { background: #f4f4f6; color: #111; }
```

### 语义色

- 成功/绿：`green-600/700` → 保障服务、绿色标签
- 错误/红：`red-500/600` → 价格高亮、错误提示
- 警告/黄：`yellow-400` → 评分星星
- 信息/蓝：`blue-500/600` → 链接、聚焦环
- AI/紫：`purple-500/600` → AI 入口、渐变

### 渐变规范

| 场景 | 渐变 |
|------|------|
| 商店标题 | `from-blue-600 via-purple-600 to-orange-500` |
| 关于我标题 | `from-purple-600 to-pink-600` |
| 博客Hero遮罩 | `from-black/80 via-black/40 to-transparent` |

## 3. 字体排版

### 字号层级（Mobile First）

| 层级 | 桌面 | 移动 | 用途 |
|------|------|------|------|
| 超大标题 | `text-7xl` | `text-5xl` | Hero 主标题 |
| 大标题 | `text-5xl` | `text-3xl` | 区块标题 |
| 中标题 | `text-4xl` | `text-2xl` | 子区块标题 |
| 小标题 | `text-2xl` | `text-xl` | 卡片标题 |
| 正文 | `text-base` | `text-sm` | 主体文字 |
| 辅助 | `text-sm` | `text-xs` | 日期、标签 |

### 行高

- 标题：`leading-tight` (1.25) ~ `leading-none` (1)
- 正文：`leading-relaxed` (1.625) ~ `leading-[2]`
- 标签字间距：`tracking-[0.2em]`

## 4. 组件设计规范

### UnoCSS 快捷类（直接使用）

```css
section-container → max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
bg-dark-card     → bg-[#121417] rounded-xl aspect-video mb-4 overflow-hidden relative
badge-green      → 绿色标签（inline-block px-3 py-1 text-xs font-bold）
badge-gray       → 灰色标签
read-more-btn    → 阅读更多按钮（黑白反转 + hover 变紫）
```

### 图标系统

使用 Carbon + Lucide 图标库，UnoCSS 方式：

```html
<div class="i-carbon-close h-5 w-5" />
<div class="i-lucide-sparkles text-2xl" />
```

### 交互状态

| 元素 | Hover | Active |
|------|-------|--------|
| 按钮 | `hover:scale-105` + 背景变化 | `active:scale-[0.98]` |
| 卡片 | `-translate-y-1` ~ `-translate-y-2` + shadow | 边框变强调色 |
| 头像 | `y: -6px, scale: 1.01` | - |
| Disabled | `opacity-50 cursor-not-allowed` | - |
| Loading | 旋转图标，隐藏文字 | - |

## 5. 响应式断点（Mobile First）

| 断点 | 宽度 | 设备 |
|------|------|------|
| 默认 | 0px | 手机竖屏 |
| `sm` | 640px | 手机横屏 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 笔记本 |
| `xl` | 1280px | 桌面 |

容器最大宽度：`max-w-7xl`（1280px），居中 + 两侧 padding。

## 6. 动效规范

### GSAP 动画（复杂场景）

- 首页 Bento Grid：ScrollTrigger 滚动入场
- 关于我页：Timeline + Scrub 滚动驱动叙事
- 角色切换：Transition Hooks 独立 GSAP 过渡

### CSS 过渡（日常交互）

| 场景 | 参数 |
|------|------|
| 卡片 hover | `transition-all duration-300` |
| 按钮交互 | `transition duration-200` |
| 主题切换 | `transition-colors duration-800` |
| 弹窗入场 | `transition duration-300 ease-out` |

### 特殊效果

- 毛玻璃：`backdrop-blur-md` + `bg-white/20`
- 噪点胶片：SVG `feTurbulence` + `mix-blend-mode: overlay`
- 粒子背景：Canvas 2D
- 呼吸灯：`animate-pulse`

## 7. 页面设计参考

创建新页面时，参考 `design/UI设计规范.md` 中的页面布局规范，确保实现与设计风格一致。

### 页面级关键设计决策

| 页面 | 路由 | 核心布局 |
|------|------|----------|
| 首页 | `/` | Hero全屏 + Logo墙 + Bento Grid + 企业案例 + CTA |
| 商品商店 | `/products` | 渐变标题 + 分类导航 + 特色大卡片(3:2) + 商品网格 |
| 商品详情 | `/products/:id` | 画廊(左7/12) + 信息面板(右5/12,sticky) + 规格 + 推荐 |
| 博客列表 | `/blog` | Hero文章 + 分类筛选 + 2列网格 + 无限滚动 |
| 博客详情 | `/blog/:id` | 文章头 + 特写大图 + 正文(680px居中) + 分享 + 推荐 |
| AI对话 | `/ai-page` | 全屏聊天容器(隐藏Navbar/Footer)，仅客户端渲染 |
| 角色展示 | `/character/:id` | 全屏沉浸式：地域栏 + 信息卡片(毛玻璃) + 立绘 + 轮播 |
| 关于我 | `/about` | 5章叙事：Hero → 字幕过渡 → 介绍 → 时间线 → 作品 → 联系 |
| 登录弹窗 | Teleport | 遮罩 + 居中面板(430px)，登录/注册双视图切换 |

### 页面级关键参数

**首页**：深色 `bg-[#08070f]`，毛玻璃搜索栏 `backdrop-blur-md bg-white/20`，GSAP ScrollTrigger 驱动 Bento Grid 入场

**商品商店**：Apple Store 风格，三色渐变标题 `from-blue-600 via-purple-600 to-orange-500`，分类导航 `flex overflow-x-auto` + 选中底部强调线

**商品详情**：左图右文 `lg:col-span-7 / lg:col-span-5`，信息区 `lg:sticky lg:top-24`，移动端底部固定操作栏 `fixed bottom-0`

**角色展示**：`h-screen` 全屏，信息卡片毛玻璃 `bg-black/58 backdrop-blur-md` + 金色边框 `border-l-4 border-[#ffcb61]`，GSAP 切换动画（背景0.7s / 立绘0.56s / 信息0.46s）

**关于我**：浅色 `bg-[#f4f4f6]`，粒子背景 + GSAP ScrollTrigger 时间线动画，轨道环旋转 + 技能标签飘浮

**登录弹窗**：Teleport to body，遮罩 `bg-slate-900/50 backdrop-blur-sm`，入场 `scale-95 → scale-100` 300ms

> 完整页面布局规范详见 `design/UI设计规范.md` 第 5 节。

## 8. 设计检查清单

新建页面或组件时，逐项确认：

- [ ] 参考 `design/UI设计规范.md` 对应页面布局规范
- [ ] 使用 Design Token 色彩，不硬编码色值（参考 `uno.config.ts` theme.colors）
- [ ] 响应式：移动端默认 → 桌面端增强
- [ ] 深色/亮色主题均测试通过
- [ ] 交互状态完整（hover/active/disabled/loading）
- [ ] 动画有明确目的，非纯装饰
- [ ] 字号层级符合排版规范（第 3 节）
- [ ] 使用 `section-container` 统一容器宽度
- [ ] 图标使用 Carbon/Lucide，不引入其他图标库
- [ ] Nuxt UI 组件（U 前缀）优先，自定义组件放 `app/components/`
