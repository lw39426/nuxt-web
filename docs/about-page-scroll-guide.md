# About 页设计与实现指南

`/about` 是入梦的个人叙事页。页面以「故事从这里开始」开场，先用四段电影字幕建立阅读节奏，再介绍人物、信念、经历和作品，最后以「让我们一起创造故事」收尾。两段固定滚动承担章节转换，资料型内容采用普通滚动，方便连续浏览。

## 页面结构

| 顺序 | 内容 | 设计与交互 |
| --- | --- | --- |
| 1 | Hero 开场 | 大号衬线标题、渐变强调字和一只戴浅紫围巾的三维小猫构成首屏。允许动效时，标题与小猫错峰入场，向下滚动时文字和角色以不同速度离场。 |
| 2 | 电影字幕序幕 | 热爱、探索、创造、向前四章由遮幅、逐行字幕和进度线串联。空间足够时固定场景，向前或向后滚动都能切换章节。 |
| 3 | 人物介绍 | 简介、统计数字和技能标签提供基本信息。宽屏双列，窄屏单列。 |
| 4 | 人物的三个切面 | 身份、信念、表达三张卡片共用一套排版。固定模式下通过前后换层和字幕交接呈现下一张，普通模式下按顺序阅读。 |
| 5 | 时间线 | 宽屏沿中轴交错展示经历，窄屏改为左侧轴线和单列条目。 |
| 6 | 代表作品 | 卡片展示图标、标题、简介与技术标签，颜色由每个作品的 `color` 决定。 |
| 7 | 联系收尾 | 大字、光晕、星点与水墨涟漪构成结束画面，底部显示页面自己的版权信息。 |

视觉上，衬线字用于主标题和引语，等宽字用于章节标签、序号和署名。紫粉渐变贯穿标题、进度线和装饰；水印、噪点和粒子分布在正文背后。布局和主题主要使用 UnoCSS，遮幅、叠卡、动效挂点和视口细节由组件的 CSS 控制。

## 路由、组件和数据

[about.vue](../app/pages/about.vue) 是路由入口，负责 SEO 和页面元信息，并渲染 [AboutClassic.vue](../app/components/about/AboutClassic.vue)。默认布局保留全站导航，根据 `hideFooter`、`hideFloatingMenu` 和 `hideAiEntry` 隐藏全站页脚、悬浮菜单、回到顶部和小星 AI 入口。右下角的主题按钮通过 `useColorMode()` 更新站点主题偏好，Canvas 绘制也读取当前主题。[default.vue](../app/layouts/default.vue)

`AboutClassic` 组合所有内容区，直接渲染 Hero、序幕和联系区，并收集页面级动画需要的 DOM 引用。

| 组件 | 内容来源与职责 |
| --- | --- |
| [AboutSection.vue](../app/components/about/AboutSection.vue) | 接收 `stats`、`skills`。统计数字由组件自己管理，首次达到观察阈值时错峰递增。服务端和减少动效模式直接显示最终值。 |
| [StorySection.vue](../app/components/about/StorySection.vue) | 本地 `scenes` 数组定义三张卡片。组件持有场景根节点，交给 `useStoryScroll` 管理布局和动画。 |
| [TimelineSection.vue](../app/components/about/TimelineSection.vue) | 通过 `events` 渲染时间线条目与轴线。 |
| [WorksSection.vue](../app/components/about/WorksSection.vue) | 通过 `works` 渲染作品卡片，并用 `--card-accent` 传递卡片强调色。 |

统计、技能、经历和作品来自 [about.ts](../app/constants/about.ts) 的静态常量。四段序幕来自 `AboutClassic.vue` 内的 `transitionChapters`。正文随 Vue 模板渲染，浏览器挂载后才初始化依赖 DOM 的动画、观察器和 Canvas。

## 滚动动画

### 视口模式

序幕和人物卡片共用 `aboutScrollMedia`。高度与宽度均指 CSS 像素。这里的 900px 是固定滚动的分界，组件模板的 `md` 则控制列数、间距等排版。

| 条件 | 电影字幕 | 人物卡片 |
| --- | --- | --- |
| 宽度 ≥ 900px，高度 ≥ 720px，且允许动效 | 固定并逐章切换 | 固定并翻阅牌叠 |
| 宽度 < 900px，高度 ≥ 600px，且允许动效 | 固定，缩短滚动距离 | 固定，使用更紧凑的卡片和滚动距离 |
| 其余尺寸且允许动效 | 按文档流排列，字幕一次性上移渐显 | 按文档流排列，卡片随进入视口轻量渐显 |
| `prefers-reduced-motion: reduce` | 按文档流静态阅读 | 按文档流静态阅读 |

`pin` 将场景固定在视口的一段位置，同时给后续内容保留滚动空间。`scrub` 把动画进度交给滚动位置，数值形式允许进度平滑追随。因此，时间轴中的 `duration` 在这两段固定场景中主要决定各动作占用的滚动比例；滚动总距离由 ScrollTrigger 的 `start` 与 `end` 决定。

### 电影字幕

[useScrollAnimations.ts](../app/composables/useScrollAnimations.ts) 在 `gsap.context` 中建立首屏入场、首屏视差、序幕和后续章节动画。序幕由 `buildTransitionTimeline` 管理：

1. 固定模式给场景设置 `data-layout="cinema"`，由 CSS 将章节叠放在同一个 Grid 区域。标题、主句各行和描述使用 `.transition-subtitle` 作为动画挂点。
2. 进入视口时先播放遮幅和首章入场。场景到达视口顶部后进入固定阶段，各章经历入场、停留、退场，末章保留在画面中直至人物介绍接上。
3. 固定距离是视口高度 × 章节数 × 系数，宽屏系数为 `1.08`，紧凑模式为 `0.82`。进度线与字幕共用时间轴，反向滚动时沿同一时间轴还原。

### Hero 三维小猫

[HeroKitten.vue](../app/components/about/HeroKitten.vue) 挂载后动态导入 [heroKittenScene.ts](../app/utils/heroKittenScene.ts)。前者负责交互、尺寸、主题和可见性，后者负责 WebGL 场景、着色器和 GPU 资源。GSAP 的首屏视差作用在 `heroVisual`，角色入场作用在内层 `heroCharacter`，模型转向由 WebGL 场景处理。

支持悬停且允许动效时，小猫随鼠标转向。可拖动旋转和俯仰，也可用方向键旋转，双击或按 Home、Enter 回正。仅触屏设备和减少动效模式展示静态正面。组件仅在画布可见、页面可见且场景就绪时绘制。WebGL 初始化失败时显示提示，上下文恢复后重新初始化，卸载时释放 GPU 资源和动画帧。

### 人物卡片

[useStoryScroll.ts](../app/composables/useStoryScroll.ts) 以故事区为选择器作用域。固定模式在 `.story-stage` 上设置 `data-layout="stacked"`，让三张卡片占用同一个 Grid 区域，由内容自然撑出舞台高度。背景卡保留轮廓，隐藏正文，避免多层文字重叠。

换卡时，前后两张卡先靠拢，再交换 `z-index` 和指针命中状态。旧字幕上移淡出，新字幕通过 `.story-subtitle` 逐行出现。宽屏固定距离为视口高度的 `2` 倍，紧凑模式为 `1.12` 倍。紧凑模式还根据导航和场景高度计算顶部偏移。

### 刷新与销毁

两段固定场景都用 `gsap.matchMedia()` 管理断点切换，退出对应模式时恢复布局属性、内联样式与固定占位。`AboutClassic` 卸载时回收页面级 GSAP 上下文，故事区在自己的卸载钩子中回收媒体查询上下文。

全局 ScrollTrigger 配置的自动刷新事件里没有 `resize`。序幕在启用动效时补充约 200ms 的合并刷新，故事区在固定模式下也补充该监听。字体加载完成后还会刷新位置，因为换行会改变舞台尺寸。序幕的固定触发器设置 `refreshPriority: 1`，让它的占位先于后续场景参与计算。[gsap.client.ts](../app/plugins/gsap.client.ts)

## Canvas 和动效偏好

| 图层 | 实现 |
| --- | --- |
| [全页粒子](../app/composables/useParticleCanvas.ts) | 固定 Canvas 绘制 50 个缓慢漂移的粒子。随窗口调整尺寸，每帧读取主题配色，页面卸载时取消帧循环并移除监听。 |
| [Hero 星芒](../app/composables/useHeroPointerEffects.ts) | 在支持悬停且允许动效时，鼠标移动产生短寿命星芒，进入小猫视觉区时产生一簇星芒。有粒子时才继续请求动画帧。 |
| [联系区水墨](../app/composables/useContactInkCanvas.ts) | 局部 Canvas 绘制星点与鼠标触发的涟漪。用 `ResizeObserver` 更新尺寸，像素倍率上限为 2；离开视口或页面隐藏时暂停逐帧绘制，减少动效模式下可见时只绘制静态画面。 |

表中的三个 Canvas 是装饰层，使用 `aria-hidden` 和 `pointer-events-none`。小猫的 WebGL Canvas 则有图像描述和独立的交互控件。减少动效时会停用 Hero 的 GSAP 入场与视差、滚动提示线、胶片噪点和统计计数。后续章节标题入场和全页粒子循环仍会运行。

## 维护入口与当前实现边界

| 要修改的内容 | 从哪里开始 |
| --- | --- |
| SEO、导航外的全局入口 | 路由页的 `useSeoMeta`、`definePageMeta` 和默认布局 |
| 序幕文案、字幕行 | `AboutClassic.vue` 的 `transitionChapters`。主句数组的每一项对应一个字幕挂点，错峰时长按实际行数计算。 |
| 人物卡片 | `StorySection.vue` 的 `scenes`。换卡的层级、站位和模板编号均围绕三张卡设计，增减卡片时需要一并调整。 |
| 小猫模型、灯光与交互 | `heroKittenScene.ts` 管理模型和渲染，`HeroKitten.vue` 管理输入、状态和生命周期。 |
| 固定阈值、阅读停留与切换速度 | `aboutScrollMedia`、两条固定时间轴的 `start`、`end`、`scrub` 以及字幕段落时长。 |
| 时间线、作品内容 | `about.ts` 中的 `timeline` 和 `works`，对应组件负责排版。 |

时间线和作品区的标题已接入页面级动画。当前 `timelineTrack`、`timelineLine`、`timelineEvents`、`workCards` 仍缺少来自子组件的 DOM 绑定，因此轴线增长、时间线条目入场和作品卡片入场尚未接通。联系区也保留了 `.contact-btn` 动画定义，但模板没有对应按钮。

验证滚动修改时，可以在 `1280 × 800`、`390 × 844` 和 `1280 × 650` 三种视口下分别检查宽屏固定、紧凑固定和矮屏文档流。重点看反向滚动是否恢复字幕与牌叠顺序、跨断点缩放后是否仍有多余占位、开启减少动效后四段字幕和三张卡片是否可连续阅读，以及离开再返回页面后是否出现重复动画。
