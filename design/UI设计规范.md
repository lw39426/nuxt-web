# NuxtWeb UI/UX 设计规范文档

> 版本：v1.0  
> 最后更新：2026-06  
> 项目代号：NuxtWeb  
> 设计系统基础：Nuxt UI v4 + UnoCSS

---

## 1. 设计语言概述

### 1.1 设计哲学

NuxtWeb 的设计语言遵循以下核心原则：

| 原则         | 说明                                                           |
| ------------ | -------------------------------------------------------------- |
| **极简克制** | 大量留白，减少视觉噪音，让内容自己说话                         |
| **深色优先** | 默认深色主题，营造沉浸式科技感和高端感                       |
| **动效叙事** | 动画不是装饰，而是引导用户注意力、讲述品牌故事的工具           |
| **一致可控** | 全局统一的设计 Token，确保跨页面的视觉一致性                   |

### 1.2 视觉风格

- **首页**：企业级品牌风格，黑白为主 + 绿色点缀（badge-green），科技感强
- **商店**：Apple Store 风格，清爽简洁，渐变标题，大量产品图
- **博客**：Medium/Dev.to 风格，内容优先，阅读体验至上
- **AI 对话**：沉浸式全屏，独立视觉体系
- **角色展示**：游戏风格，全屏背景 + 毛玻璃信息卡片，电影感过渡
- **关于我**：艺术作品集风格，粒子背景 + 噪点胶片质感 + 紫粉渐变
- **个人中心**：弥散光感渐变，主色调（马卡龙/低饱和度粉彩）：

浅紫色/薰衣草紫：集中在左侧和左上角，带来宁静、现代的感觉。

浅桃粉色/珊瑚橘：集中在中间偏右区域，增添了温暖和柔和的过渡。

奶黄色/米白色：在右侧和底部边缘，提升了整体的明亮度。

纯白/浅灰底色：作为基底，让所有颜色显得非常通透

---

## 2. 色彩体系

### 2.1 主题系统

项目支持 **明/暗/跟随系统** 三种主题模式，通过 `useThemeStore` 管理。

```
ThemeMode = 'system' | 'light' | 'dark'
```

### 2.2 品牌色板

#### 基础色（UnoCSS theme.colors）

| Token              | 亮色值       | 暗色值       | 用途                 |
| ------------------ | ------------ | ------------ | -------------------- |
| `home-black`       | `#000000`    | -            | 主背景/按钮          |
| `home-white`       | `#F7F7F8`    | -            | 浅灰背景             |
| `home-gray`        | `#666666`    | -            | 次要文字             |
| `home-accent`      | `#455293`    | `#455293`    | 强调色（分类激活态） |
| `home-border`      | `#E5E7EB`    | -            | 边框色               |

#### 文字色

| Token              | 亮色值       | 暗色值       | 用途                 |
| ------------------ | ------------ | ------------ | -------------------- |
| `mingtext-dark`    | `#0B0C10`    | -            | 主文字（亮色模式）   |
| `mingtext-light`   | `#F7F7F8`    | -            | 主文字（暗色模式）   |
| `mingtext-gray`    | `#f1f1f1`    | -            | 占位符/浅色文字      |
| `mingtext-title`   | `#0B0C10`    | -            | 标题文字             |
| `mingtext-subtitle`| `#666666`    | -            | 副标题文字           |

#### 卡片色

| Token          | 亮色值       | 暗色值       | 用途                 |
| -------------- | ------------ | ------------ | -------------------- |
| `card-dark`    | `#121417`    | -            | 深色卡片背景         |
| `card-light`   | `#F7F7F8`    | -            | 浅色卡片背景         |

#### 语义色

| 语义     | 色值              | 用途                           |
| -------- | ----------------- | ------------------------------ |
| 成功/绿  | `green-600/700`   | 保障服务标记、绿色标签         |
| 错误/红  | `red-500/600`     | 价格高亮、错误提示、购买按钮   |
| 警告/黄  | `yellow-400`      | 评分星星                       |
| 信息/蓝  | `blue-500/600`    | 链接、登录按钮、聚焦环         |
| 紫色     | `purple-500/600`  | AI 入口、关于我渐变、Tracker   |
| 粉色     | `pink-600`        | 关于我渐变终点                 |

### 2.3 全局背景色

```css
/* 亮色模式 */
body { background: #f4f4f6; color: #111; }

/* 暗色模式 */
body { background: #08070f; color: #e8e0ff; }
```

### 2.4 渐变用法

| 名称               | 渐变定义                                         | 使用场景           |
| ------------------ | ------------------------------------------------ | ------------------ |
| 商店标题渐变       | `from-blue-600 via-purple-600 to-orange-500`     | 商店页 H1          |
| 关于我标题渐变     | `from-purple-600 to-pink-600`                    | 关于我页渐变文字   |
| 角色信息金色       | `#ffcb61`                                        | 角色 CV/元素高亮   |
| 暗色遮罩渐变       | `from-black/80 via-black/40 to-transparent`      | 博客 Hero 图叠加   |

---

## 3. 字体排版规范

### 3.1 字体族

| 字体名称           | 用途                           | 引入方式         |
| ------------------ | ------------------------------ | ---------------- |
| `font-sans`        | 全局默认字体（系统字体栈）     | Tailwind/UnoCSS  |
| `font-display`     | 大标题展示字体                 | Nuxt UI          |
| `Noto Serif SC`    | 中文衬线标题（关于我页）       | Google Fonts     |
| `Space Mono`       | 等宽英文标签/代码风格文字      | Google Fonts     |
| `Noto Sans SC`     | 中文正文字体                   | Google Fonts     |

### 3.2 字号层级

| 层级       | 桌面端           | 移动端           | 用途               |
| ---------- | ---------------- | ---------------- | ------------------ |
| 超大标题   | `text-7xl` (72px)| `text-5xl` (48px)| Hero 主标题        |
| 大标题     | `text-5xl` (48px)| `text-3xl` (30px)| 区块标题           |
| 中标题     | `text-4xl` (36px)| `text-2xl` (24px)| 子区块标题         |
| 小标题     | `text-2xl` (24px)| `text-xl` (20px) | 卡片标题           |
| 正文       | `text-base` (16px)| `text-sm` (14px)| 主体文字           |
| 辅助文字   | `text-sm` (14px) | `text-xs` (12px) | 日期、标签、脚注   |

### 3.3 行高与间距

- 标题行高：`leading-tight` (1.25) 至 `leading-none` (1)
- 正文行高：`leading-relaxed` (1.625) 至 `leading-[2]`
- 字间距：标签类使用 `tracking-[0.2em]`，正文使用默认

---

## 4. 组件库说明

### 4.1 基础组件框架

项目基于 **Nuxt UI v4**（`@nuxt/ui ^4.2.1`），提供以下开箱即用组件：

| 组件         | 用途                     | 使用场景               |
| ------------ | ------------------------ | ---------------------- |
| `UApp`       | 应用根容器               | app.vue 根组件         |
| `UButton`    | 按钮                     | 各页面操作按钮         |
| `UIcon`      | 图标                     | 全局图标渲染           |
| `UMarquee`   | 跑马灯/轮播              | 首页社交 Logo 滚动     |
| `useToast`   | Toast 提示               | API 错误/成功提示      |

### 4.2 自定义组件

| 组件                    | 文件                                | 用途                     |
| ----------------------- | ----------------------------------- | ------------------------ |
| `AppNavbarLayout`       | `components/AppNavbarLayout.vue`    | 全局导航栏               |
| `AppFooter`             | `components/AppFooter.vue`          | 全局页脚                 |
| `AppFloatingMenu`       | `components/AppFloatingMenu.vue`    | 悬浮菜单                 |
| `AppGlobalLoader`       | `components/AppGlobalLoader.vue`    | 全局加载动画             |
| `AuthModal`             | `components/AuthModal.vue`          | 登录/注册弹窗            |
| `ProductCard`           | `components/product/ProductCard.vue`| 商品卡片                 |
| `ProductFilters`        | `components/product/ProductFilters.vue`| 商品筛选器            |
| `ProductGallery`        | `components/product/ProductGallery.vue`| 商品图片画廊          |
| `BlogCard`              | `components/BlogCard.vue`           | 博客文章卡片             |
| `ArticleCard`           | `components/ArticleCard.vue`        | 文章卡片（另一种样式）   |
| `GsapHome`              | `components/home/GsapHome.vue`      | 首页特性展示（GSAP驱动） |
| `AiCompanion`           | `components/AiCompanion.client.vue` | AI 对话组件（仅客户端）  |
| `AiSidebar`             | `components/AiSidebar.client.vue`   | AI 侧边栏（仅客户端）    |

### 4.3 UnoCSS 快捷工具类（Shortcuts）

```css
/* 标准区块容器 */
section-container → max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

/* 深色卡片背景 */
bg-dark-card → bg-[#121417] rounded-xl aspect-video mb-4 overflow-hidden relative

/* 阅读更多按钮 */
read-more-btn → flex items-center gap-2 px-6 py-3 text-sm font-bold ...

/* 绿色标签 */
badge-green → inline-block px-3 py-1 text-xs font-bold text-green-700 ...

/* 灰色标签 */
badge-gray → inline-block px-3 py-1 text-xs font-bold text-gray-700 ...
```

---

## 5. 页面布局规范

### 5.1 全局布局结构

```
┌──────────────────────────────────┐
│         AppNavbarLayout          │  ← 固定顶部导航
├──────────────────────────────────┤
│                                  │
│         <NuxtPage />             │  ← 页面内容区
│         (flex-1)                 │
│                                  │
├──────────────────────────────────┤
│           AppFooter              │  ← 页脚
├──────────────────────────────────┤
│       AppFloatingMenu            │  ← 悬浮菜单（右下角）
│       AI 入口按钮                │  ← AI 悬浮按钮（右侧）
└──────────────────────────────────┘
│           AuthModal              │  ← 模态弹窗层（Teleport）
└──────────────────────────────────┘
```

### 5.2 各页面线框描述

#### 首页（`/`）

```
┌──────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓ Hero 全屏背景图 ▓▓▓▓▓▓▓▓▓▓▓ │  h-screen
│         「Just Build It!」               │
│     [毛玻璃搜索框: 你想了解什么？]       │
├──────────────────────────────────────────┤
│  [Logo] [Logo] [Logo] [Logo]            │  Logo墙
├──────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐            │  Bento Grid
│  │ 特性1 │ │ 特性2 │ │ 特性3 │           │  (GSAP动画)
│  └──────┘ └──────┘ └──────┘            │
├──────────────────────────────────────────┤
│  [badge: 企业智能升级]                   │
│  ┌──────────────────────────────────┐   │  客户案例大卡片
│  │ Anthropic 案例  │  2M+  │  3+   │   │
│  └──────────────────────────────────┘   │
├──────────────────────────────────────────┤
│  [Card1] [Card2] [Card3]                │  客户案例 3列
├──────────────────────────────────────────┤
│  ←── 社交图标跑马灯 ──→                 │  Marquee
│  [免费开始]  [预约演示]                  │  CTA
└──────────────────────────────────────────┘
```

#### 商品商店（`/products`）

```
┌──────────────────────────────────────────┐
│  「商店」渐变标题                         │
│  [分类图标1] [分类2] [分类3] ...  →滚动  │
├──────────────────────────────────────────┤
│  iPhone 系列                             │
│  ┌───────────────┐ ┌────┐ ┌────┐       │
│  │ 特色产品大卡片 │ │卡片│ │卡片│        │
│  │ (3/5宽度)     │ │    │ │    │        │
│  └───────────────┘ └────┘ └────┘       │
│  [卡3] [卡4] [卡5] [卡6] [卡7]         │
│  ─────────── 分割线 ──────────          │
│  Mac 系列                                │
│  ...                                     │
└──────────────────────────────────────────┘
```

#### 商品详情（`/products/:id`）

```
┌──────────────────────────────────────────┐
│  首页 / 商品 / iPhone 16 Pro            │  面包屑
│                                          │
│  ┌──────────────────┐  标题              │
│  │                  │  ★★★★★ (128)      │
│  │   主图展示区     │  ¥8999  ~~¥9999~~ │
│  │   (7/12 宽度)    │  优惠信息...       │
│  │                  │  颜色: [黑][白][蓝] │
│  └──────────────────┘  版本: [128][256]  │
│  [缩略1] [缩略2] [缩略3]  数量: [-1+]   │
│                         [加入购物车]      │
│                         [立即购买]        │
├──────────────────────────────────────────┤
│  规格参数            │  商品描述          │
├──────────────────────────────────────────┤
│  你可能也喜欢: [卡1] [卡2] [卡3] [卡4]  │
└──────────────────────────────────────────┘
│  移动端: [加入购物车] [立即购买] 固定底部 │
```

### 5.3 导航栏

- 可通过 `$route.meta.hideNavbar` 隐藏
- 支持胶囊样式（`$route.meta.forceCapsule`）
- 响应式：桌面端完整导航，移动端汉堡菜单

---

## 6. 响应式断点策略

### 6.1 断点定义

| 断点名 | 最小宽度 | 典型设备               |
| ------ | -------- | ---------------------- |
| 默认   | 0px      | 手机竖屏               |
| `sm`   | 640px    | 手机横屏/小平板        |
| `md`   | 768px    | 平板                   |
| `lg`   | 1024px   | 小笔记本               |
| `xl`   | 1280px   | 桌面显示器             |
| `2xl`  | 1536px   | 大桌面显示器           |

### 6.2 响应式策略

- **Mobile First**：默认样式面向手机，逐步向上增加复杂度
- **关键布局变化**：
  - 商品页：手机单列 → 桌面左 7/12 + 右 5/12
  - 博客：手机单列 → md 双列
  - 首页客户案例：手机单列 → md 三列
  - 角色展示：手机下拉选择 → 桌面侧边栏
- **容器最大宽度**：`max-w-7xl`（1280px），居中 + 两侧 padding

---

## 7. 动效规范

### 7.1 GSAP 动画体系

项目使用 **GSAP 3.13** 作为核心动画引擎，以下为主要动画场景：

#### 页面级动画

| 页面       | 动画类型            | 描述                                         |
| ---------- | ------------------- | -------------------------------------------- |
| 首页       | ScrollTrigger       | Bento Grid 特性卡片滚动触发入场              |
| 关于我     | Timeline + Scrub    | 5 章叙事结构，滚动驱动时间线动画             |
| 角色展示   | Transition Hooks    | 角色切换时背景/立绘/信息独立 GSAP 过渡       |

#### 关于我页动画详细参数

| 场景             | 动画效果                               | 时长/参数                    |
| ---------------- | -------------------------------------- | ---------------------------- |
| Hero 入场        | 标题从下方滑入 + 淡入                  | duration: 1.2s, ease: expo.out |
| 电影字幕         | 上下遮幅从外侧滑入 + 引语淡入         | scrub: 1                     |
| 人物介绍         | 左右分屏滑入                           | duration: 1.2s, x: ±50      |
| 技能标签         | 依次弹入                               | stagger: 0.1, ease: back.out(1.5) |
| 数字跳动         | 从 0 计数到目标值                      | duration: 2.5s, ease: expo.out |
| 时间线           | 中线从顶向下生长 + 卡片左右交替滑入    | scrub: 1                     |
| 作品卡片         | 依次从下方弹入                         | stagger: 0.1                 |

#### 角色展示过渡参数

| 元素     | 入场                          | 离场                          |
| -------- | ----------------------------- | ----------------------------- |
| 背景图   | opacity: 0→0.6, 0.7s, power3.out | opacity: 0.6→0, 0.4s, power2.inOut |
| 地域水印 | opacity: 0→1, x: 16→0, 0.55s | opacity: 1→0, x: 0→-10, 0.28s |
| 角色立绘 | opacity: 0→1, x: 56→0, 0.56s | opacity: 1→0, x: 0→-42, 0.32s |
| 信息区   | opacity: 0→1, x: -24→0, 0.46s + 子项 stagger: 0.06 | opacity: 1→0, x: 0→-18, 0.22s |

### 7.2 CSS 过渡

| 场景             | 过渡参数                  | 说明                     |
| ---------------- | ------------------------- | ------------------------ |
| 卡片悬浮         | `transition-all duration-300` | hover 效果             |
| 按钮交互         | `transition duration-200`  | 颜色/背景变化            |
| 主题切换         | `transition-colors duration-800` | 明暗主题渐变过渡   |
| 模态弹窗入场     | `transition duration-300 ease-out` | scale + translate  |

### 7.3 微交互

| 交互             | 效果                                       |
| ---------------- | ------------------------------------------ |
| 角色头像 hover   | y: -6px, scale: 1.01, 0.28s               |
| 卡片 hover       | -translate-y-1 至 -translate-y-2 + shadow  |
| 按钮 hover       | hover:scale-105 至 hover:scale-110         |
| 分类图标 hover   | -translate-y-1, 0.3s                       |
| 时间线节点 hover | scale: 1.3 + 紫色发光 box-shadow           |
| AI 入口按钮      | animate-pulse 呼吸灯效果                   |

### 7.4 特殊视觉效果

| 效果               | 实现方式                                     | 使用场景       |
| ------------------ | -------------------------------------------- | -------------- |
| 毛玻璃             | `backdrop-blur-md` + `bg-white/20`           | 搜索框、信息卡 |
| 噪点胶片           | SVG feTurbulence + mix-blend-mode: overlay   | 关于我页       |
| 粒子背景           | Canvas 2D 绘制 50 个粒子                    | 关于我页       |
| 旋转光环           | CSS border + animate-spin（25s/35s/50s）     | 关于我 Hero    |
| 图片渐变遮罩       | mask-image: linear-gradient                  | 首页 Hero 底部 |

---

## 8. 图标体系

### 8.1 图标库

| 图标库              | 包名                       | 使用方式              |
| ------------------- | -------------------------- | --------------------- |
| Carbon Icons        | `@iconify-json/carbon`     | `i-carbon-*`          |
| Lucide Icons        | `@iconify-json/lucide`     | `i-lucide-*`          |

### 8.2 图标使用规范

```html
<!-- 基本用法 -->
<div class="i-carbon-close h-5 w-5" />
<div class="i-carbon-arrow-right" />
<div class="i-lucide-sparkles text-2xl" />

<!-- 带颜色 -->
<div class="i-carbon-logo-wechat h-6 w-6 text-emerald-500" />
<div class="i-carbon-logo-github h-6 w-6 text-slate-700" />
```

### 8.3 常用图标清单

| 图标名                    | 用途                 |
| ------------------------- | -------------------- |
| `i-carbon-close`          | 关闭/取消            |
| `i-carbon-chevron-right`  | 向右箭头             |
| `i-carbon-chevron-left`   | 向左箭头             |
| `i-carbon-chevron-down`   | 下拉箭头             |
| `i-carbon-arrow-right`    | 前进箭头             |
| `i-carbon-arrow-left`     | 返回箭头             |
| `i-carbon-maximize`       | 全屏/放大            |
| `i-carbon-view`           | 显示密码             |
| `i-carbon-view-off`       | 隐藏密码             |
| `i-carbon-star-filled`    | 实心星（评分）       |
| `i-carbon-star`           | 空心星（评分）       |
| `i-carbon-package`        | 商品/包裹            |
| `i-carbon-rss`            | RSS 订阅             |
| `i-carbon-microphone`     | 语音/麦克风          |
| `i-carbon-volume-up`      | 播放音频             |
| `i-carbon-circle-dash`    | 加载中（旋转）       |
| `i-carbon-logo-wechat`    | 微信                 |
| `i-carbon-logo-github`    | GitHub               |
| `i-carbon-logo-google`    | Google               |
| `i-carbon-logo-twitter`   | Twitter              |
| `i-carbon-logo-linkedin`  | LinkedIn             |
| `i-carbon-link`           | 复制链接             |
| `i-lucide-sparkles`       | AI 闪光（AI 入口）   |

---

## 9. 交互状态规范

### 9.1 按钮状态

| 状态     | 样式变化                                    |
| -------- | ------------------------------------------- |
| 默认     | 基础背景色 + 文字色                         |
| Hover    | 背景色加深/变浅 + scale(1.05)               |
| Active   | scale(0.98)（按下反馈）                     |
| Disabled | opacity: 50% + cursor: not-allowed          |
| Loading  | 显示旋转图标，隐藏文字                      |

### 9.2 输入框状态

| 状态     | 样式变化                                    |
| -------- | ------------------------------------------- |
| 默认     | `border-slate-200` / dark: `border-slate-700`|
| Focus    | `border-blue-500` + `ring-3 ring-blue-500/20`|
| Error    | Toast 弹窗提示（红色）                       |

### 9.3 卡片状态

| 状态     | 样式变化                                    |
| -------- | ------------------------------------------- |
| 默认     | 基础阴影 + 边框                              |
| Hover    | -translate-y-1 至 y-2 + shadow 增强 + border 高亮 |
| Active   | 边框变为强调色                               |

---

## 10. 滚动条与细节

### 10.1 自定义滚动条

```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #08070f; }
::-webkit-scrollbar-thumb {
  background: rgba(167, 139, 250, 0.4); /* 紫色 */
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(167, 139, 250, 0.7);
}
```

### 10.2 隐藏滚动条工具类

多个场景使用 `no-scrollbar` 或 `scrollbar-hide` 类隐藏滚动条（分类导航、轮播器等）。

### 10.3 文字选中色

```css
selection:bg-[#0fba81]/20 selection:text-900
```

### 10.4 全局加载动画

使用自定义 CSS 动画的弹跳方块作为全局 Loader，位于 `AppGlobalLoader` 组件中。
