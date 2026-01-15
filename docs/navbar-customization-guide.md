# 导航栏组件调整指南

## 📋 目录
- [核心原理](#核心原理)
- [快速调整](#快速调整)
- [详细参数说明](#详细参数说明)
- [常见场景示例](#常见场景示例)
- [性能优化原理](#性能优化原理)
- [注意事项](#注意事项)

---

## 核心原理

### 为什么这样设计？

当前导航栏采用"三层分离"架构，解决了传统实现的两大痛点：

#### 问题1：传统方式的卡顿
```vue
<!-- ❌ 传统实现（会卡） -->
<div :class="isScrolled ? 'w-[92%] px-6 py-3' : 'w-full px-8 py-4'">
  内容
</div>
```
**为什么卡？** 每次切换 `w-[92%]` ↔ `w-full` 会触发浏览器 layout（重排），在动画过程中每一帧都要重新计算布局，导致掉帧。

#### 问题2：传统 transform 的变形
```vue
<!-- ❌ 用 scaleX 缩放（文字会被压扁） -->
<div style="transform: scaleX(0.8)">
  <p>文字被压扁了</p>
</div>
```

#### ✅ 当前解决方案
```vue
<!-- 三层架构 -->
<div class="shell">  <!-- 整体下移层 -->
  <div class="bg" :style="bgTransform">  <!-- 背景缩放层 -->
  </div>
  <div class="content">  <!-- 内容不变形 -->
    <div :style="leftTransform">Logo</div>
    <div>菜单（不动）</div>
    <div :style="rightTransform">按钮</div>
  </div>
</div>
```

**优势**：
1. 只动 `transform`（走 GPU 合成层），不触发 layout
2. 背景缩放不影响文字（分层处理）
3. 左右内容用 `translateX` 模拟收缩（不压缩字体）

---

## 快速调整

### 1. 修改菜单项
**位置**：第 5-10 行
```javascript
const menuItems = [
  { name: 'Products', href: '/products' },
  { name: 'Blog', href: '/blog' },
  { name: 'Pricing', href: '#' },
  { name: 'About Us', href: '/about' },
  // 🔧 添加新菜单
  { name: 'Contact', href: '/contact' }
]
```

---

### 2. 调整胶囊宽度
**位置**：第 36 行 `getTargetMetrics` 函数
```javascript
// 当前：92% 宽度，最大 768px
const targetWidth = Math.min(window.innerWidth * 0.92, 768)

// 🔧 调整选项：
const targetWidth = Math.min(window.innerWidth * 0.85, 900)  // 更宽的胶囊
const targetWidth = Math.min(window.innerWidth * 0.98, 600)  // 更窄的胶囊
```

**参数说明**：
- `0.92` = 屏幕宽度的 92%
- `768` = 最大宽度（px），超过此值不再缩小

---

### 3. 调整下移距离
**位置**：第 38 行
```javascript
// 当前：下移 8px
const translateY = scrolled ? 8 : 0

// 🔧 调整：
const translateY = scrolled ? 16 : 0  // 下移更多
const translateY = scrolled ? 4 : 0   // 下移更少
const translateY = 0                  // 完全不下移
```

---

### 4. 调整动画速度
**位置**：第 88 行
```javascript
// 当前：280ms
const duration = 280
const easing = 'cubic-bezier(0.2, 0, 0, 1)'

// 🔧 调整速度：
const duration = 400  // 更慢、更优雅
const duration = 180  // 更快、更敏捷

// 🔧 调整缓动曲线：
const easing = 'ease-out'                       // 快进慢出
const easing = 'cubic-bezier(0.4, 0, 0.2, 1)'  // Material Design
const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)' // 弹性效果
```

**常见缓动曲线对比**：
| 曲线 | 效果 | 适用场景 |
|------|------|----------|
| `cubic-bezier(0.2, 0, 0, 1)` | 当前：流畅自然 | 通用 |
| `ease-out` | 快进慢出 | 简单动画 |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | 轻微回弹 | 突出效果 |

---

### 5. 修改圆角大小
**位置**：第 206 行（背景层）
```vue
<div
  ref="navBgRef"
  class="... rounded-full ..."  <!-- 当前：完全圆角 -->
>
```

**🔧 调整选项**：
```vue
rounded-full    <!-- 完全圆角（当前） -->
rounded-3xl     <!-- 较大圆角 (24px) -->
rounded-2xl     <!-- 中等圆角 (16px) -->
rounded-xl      <!-- 小圆角 (12px) -->
```

---

### 6. 调整内边距（影响胶囊饱满度）
**位置**：第 197 行
```vue
<div class="... px-8 py-4 ...">  <!-- 当前值 -->
```

**🔧 常见组合**：
```vue
px-8 py-4   <!-- 当前：圆润饱满 -->
px-6 py-3   <!-- 紧凑型 -->
px-10 py-5  <!-- 更宽松 -->
px-12 py-6  <!-- 超大气（适合大屏） -->
```

**调整原则**：
- `py` 值越大，胶囊越"圆"（高度增加）
- `px` 值影响左右留白，但不影响收缩动画

---

### 7. 修改背景样式
**位置**：第 207-210 行
```vue
:class="[
  isScrolled
    ? 'bg-white/90 dark:bg-neutral-900/80 backdrop-blur-md rounded-full shadow-lg ring-1 ring-black/5'
    : 'bg-transparent'
]"
```

**🔧 背景透明度**：
```vue
bg-white/90     <!-- 当前：90% 不透明 -->
bg-white/95     <!-- 更不透明 -->
bg-white/80     <!-- 更透明 -->
bg-white        <!-- 完全不透明 -->
```

**🔧 毛玻璃效果**：
```vue
backdrop-blur-md    <!-- 当前：中等模糊 -->
backdrop-blur-sm    <!-- 轻微模糊 -->
backdrop-blur-lg    <!-- 更强模糊 -->
backdrop-blur-none  <!-- 无模糊（性能更好） -->
```

**🔧 阴影强度**：
```vue
shadow-lg    <!-- 当前：大阴影 -->
shadow-xl    <!-- 超大阴影 -->
shadow-md    <!-- 中等阴影 -->
shadow-sm    <!-- 轻微阴影 -->
```

---

### 8. 调整滚动触发灵敏度
**位置**：第 168 行（IntersectionObserver 配置）
```javascript
observer = new IntersectionObserver(handleIntersection, {
  root: null,
  threshold: 0,
  rootMargin: '10px 0px 0px 0px'  // 当前：提前 10px 触发
})
```

**🔧 调整触发时机**：
```javascript
rootMargin: '0px 0px 0px 0px'      // 精确触发（到顶部才变）
rootMargin: '50px 0px 0px 0px'     // 提前触发（滚动 50px 就变）
rootMargin: '-20px 0px 0px 0px'    // 延迟触发（滚过 20px 才变）
```

---

## 详细参数说明

### getTargetMetrics 函数（核心计算逻辑）
**位置**：第 25-41 行

```javascript
const getTargetMetrics = (scrolled) => {
  const shell = navShellRef.value
  if (!shell) {
    return {
      bgScaleX: 1,      // 背景缩放倍数
      translateY: 0,    // 下移距离
      insetX: 0         // 左右收缩距离
    }
  }

  const baseWidth = shell.getBoundingClientRect().width  // 容器原始宽度
  const targetWidth = Math.min(window.innerWidth * 0.92, 768)  // 目标宽度
  const bgScaleX = scrolled ? Math.min(1, Math.max(0.5, targetWidth / baseWidth)) : 1
  const insetX = scrolled ? Math.max(0, (baseWidth - targetWidth) / 2) : 0
  const translateY = scrolled ? 8 : 0

  return { bgScaleX, translateY, insetX }
}
```

**参数详解**：

| 参数 | 作用 | 取值范围 | 调整建议 |
|------|------|----------|----------|
| `bgScaleX` | 背景水平缩放 | 0.5 - 1.0 | 不建议修改公式 |
| `insetX` | 左右内容收缩距离 | 0 - ∞ | 由 `targetWidth` 自动计算 |
| `translateY` | 整体下移距离 | 0 - 50px | 可调整数值 |

---

### 动画配置参数
**位置**：第 88-89 行

```javascript
const duration = 280  // 动画时长（毫秒）
const easing = 'cubic-bezier(0.2, 0, 0, 1)'  // 缓动函数
```

**性能建议**：
- `duration < 200ms`：太快，用户感受不到过渡
- `200-400ms`：最佳范围，既流畅又不拖沓
- `duration > 500ms`：太慢，感觉迟缓

---

## 常见场景示例

### 场景1：制作"更紧凑"的导航栏
```vue
<!-- 修改第 197 行 -->
<div class="nav-shell relative w-full max-w-7xl px-4 py-2">

<!-- 修改第 36 行 -->
const targetWidth = Math.min(window.innerWidth * 0.88, 600)

<!-- 修改第 88 行 -->
const duration = 200
```
**效果**：更小的胶囊、更快的动画

---

### 场景2：完全去掉下移效果，只做收缩
```javascript
// 第 38 行改为：
const translateY = 0  // 不下移
```
**效果**：导航栏只会变窄，不会往下移动

---

### 场景3：制作"弹性效果"的动画
```javascript
// 第 89 行改为：
const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
```
**效果**：收缩时会"超过目标位置再弹回"（类似橡皮筋）

---

### 场景4：固定宽度胶囊（不根据屏幕宽度变化）
```javascript
// 第 36 行改为：
const targetWidth = 800  // 固定 800px
```
**效果**：滚动后始终是 800px 宽，不随屏幕尺寸变化

---

### 场景5：添加渐变背景
```vue
<!-- 第 207-210 行改为： -->
:class="[
  isScrolled
    ? 'bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-md rounded-full shadow-lg'
    : 'bg-transparent'
]"
```
**效果**：胶囊背景变为蓝紫渐变

---

### 场景6：移除模糊效果（提升性能）
```vue
<!-- 第 207-210 行移除 backdrop-blur-md： -->
:class="[
  isScrolled
    ? 'bg-white/95 rounded-full shadow-lg ring-1 ring-black/5'
    : 'bg-transparent'
]"
```
**效果**：纯色背景，性能更好（尤其在低端设备）

---

### 场景7：调整移动端菜单样式
**位置**：第 317-323 行
```vue
<!-- 当前圆角 -->
'rounded-3xl'

<!-- 改为方形 -->
'rounded-lg'

<!-- 改为无圆角 -->
'rounded-none'
```

---

## 性能优化原理

### 为什么这样设计能达到 60fps？

#### 1. 只动 `transform` 和 `opacity`
```javascript
// ✅ 走合成层（GPU 加速）
element.style.transform = 'translateX(10px)'

// ❌ 触发 layout（CPU 重排）
element.style.width = '500px'
```

**性能对比**：
| 属性类型 | 触发阶段 | 性能 | 帧率 |
|----------|----------|------|------|
| `transform` / `opacity` | Composite | ⚡️ 极快 | 60fps |
| `background` / `color` | Paint | ⚠️ 中等 | 30-60fps |
| `width` / `padding` / `margin` | Layout | 🐌 慢 | 15-30fps |

#### 2. 背景与内容分层
```vue
<!-- 背景层：只做 scaleX -->
<div class="bg" :style="{ transform: `scaleX(${scale})` }"></div>

<!-- 内容层：不受 scale 影响 -->
<div class="content">文字不变形</div>
```

**关键**：`scaleX` 只作用在背景层，内容层用 `translateX` 模拟收缩。

#### 3. 使用 Web Animations API
```javascript
// ✅ 当前方式
element.animate([from, to], { duration, easing })

// ❌ 传统 CSS transition（会阻塞主线程）
element.style.transition = 'all 0.3s'
```

**优势**：
- 动画可以在独立线程运行
- 支持更精细的控制（cancel、pause）
- 性能更稳定

#### 4. `will-change` 提示浏览器
```vue
<div style="will-change: transform">
```
告诉浏览器"这个元素会动画"，提前创建合成层。

**注意**：不要滥用 `will-change`，只在动画元素上使用。

---

## 注意事项

### ⚠️ 修改时的常见陷阱

#### 陷阱1：在 `navShellRef` 上添加 `scaleX`
```javascript
// ❌ 错误：会压扁所有内容
shell.style.transform = `scaleX(0.8)`

// ✅ 正确：只在背景层缩放
bg.style.transform = `scaleX(0.8)`
```

#### 陷阱2：修改内边距触发动画
```vue
<!-- ❌ 会导致卡顿 -->
:class="isScrolled ? 'px-8' : 'px-4'"

<!-- ✅ 保持固定，用 transform 模拟 -->
class="px-8"
```

#### 陷阱3：在滚动事件中直接修改状态
```javascript
// ❌ 会导致频繁重绘
window.addEventListener('scroll', () => {
  isScrolled.value = window.scrollY > 0
})

// ✅ 使用 IntersectionObserver（当前方式）
observer = new IntersectionObserver(handleIntersection)
```

#### 陷阱4：忘记取消之前的动画
```javascript
// 当前代码已处理（第 78-81 行）
if (flipAnimation) {
  flipAnimation.cancel()  // 防止快速滚动时动画叠加
}
```

---

### 🔒 不建议修改的部分

以下代码是性能优化的核心，**不建议修改**：

1. **第 43-56 行** `applyTransformsImmediately` 函数
   - 确保动画取消时状态正确
   
2. **第 91-130 行** 四个动画对象
   - `bgAnim`、`shellAnim`、`leftAnim`、`rightAnim`
   - 除非理解 FLIP 原理，否则不要改动

3. **第 335-352 行** CSS 优化
   - `transform: translateZ(0)`、`contain: paint` 等
   - 这些是性能关键

---

### 🎯 调试技巧

#### 1. 查看动画性能
打开 Chrome DevTools → Performance → 录制滚动操作：
- **绿色（Composite）**：理想状态 ✅
- **紫色（Paint）**：可接受 ⚠️
- **黄色（Layout）**：需要优化 ❌

#### 2. 检查合成层
DevTools → Layers 面板：
- 查看 `.nav-shell` 是否是独立合成层
- 确认 `will-change` 生效

#### 3. 测试卡顿
```javascript
// 在第 88 行临时添加：
const duration = 2000  // 放慢到 2 秒观察动画细节
```

---

## 高级定制

### 添加滚动进度动画
```javascript
// 在 getTargetMetrics 中添加：
const scrollProgress = Math.min(window.scrollY / 300, 1)
const translateY = scrolled ? 8 * scrollProgress : 0
```
**效果**：下移距离随滚动距离渐变

---

### 根据页面不同显示不同样式
```javascript
// 在 <script setup> 中添加：
const route = useRoute()
const isDarkNav = computed(() => route.path === '/about')

// 修改背景样式：
:class="[
  isScrolled
    ? isDarkNav 
      ? 'bg-black/90 ...' 
      : 'bg-white/90 ...'
    : 'bg-transparent'
]"
```

---

### 添加滚动方向判断
```javascript
let lastScrollY = 0
const isScrollingDown = ref(false)

const handleIntersection = (entries) => {
  const currentScrollY = window.scrollY
  isScrollingDown.value = currentScrollY > lastScrollY
  lastScrollY = currentScrollY
  
  const nextScrolled = !entries[0].isIntersecting
  if (nextScrolled === isScrolled.value) return
  void runTransform(nextScrolled)
}
```
**用途**：向下滚动时收缩，向上滚动时保持展开

---

## 总结

### 最常用的 5 个调整点
1. **菜单项**（第 5-10 行）
2. **胶囊宽度**（第 36 行）
3. **动画速度**（第 88 行）
4. **圆角大小**（第 206 行）
5. **背景样式**（第 207-210 行）

### 调整原则
- ✅ 改变数值、颜色、间距 → 安全
- ⚠️ 修改动画逻辑 → 谨慎测试
- ❌ 改变三层架构 → 不建议

### 性能保证
只要遵循"只动 `transform`"的原则，就能保证 60fps。

---

## 版本记录
- **v1.0** (2026-01-13): 初始版本，解决卡顿和变形问题
- 优化方式：三层分离 + Web Animations API + IntersectionObserver

---

## 相关文档
- [GSAP 优化记录](./GSAP_OPTIMIZATION_COMPLETE.md)
- [最终优化报告](./FINAL_OPTIMIZATION_COMPLETE.md)
