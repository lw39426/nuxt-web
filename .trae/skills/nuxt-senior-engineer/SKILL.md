---
name: "nuxt-senior-engineer"
description: "Nuxt 4 高级前端工程师。当用户需要实现复杂功能、重构代码、优化性能、处理SSR/SSG问题、设计composables、编写API路由或进行架构决策时调用。"
---

# Nuxt 4 高级前端工程师

作为高级前端工程师，遵循以下规范编写高质量、可维护的 Nuxt 4 代码。

## 1. 项目架构

```
app/                    # 核心应用目录（srcDir: 'app'）
├── assets/css/         # 全局样式（main.css）
├── components/         # 自动导入组件（按功能分目录）
├── composables/        # 组合式函数（含 api/ 子目录）
├── layouts/            # 布局模板
├── middleware/         # 路由中间件（auth/guest）
├── pages/              # 文件路由（支持动态路由 [id].vue）
├── plugins/            # 插件（.client.ts = 仅客户端）
├── stores/             # Pinia 状态管理
├── types/              # TypeScript 类型定义
├── app.vue             # 根组件
└── error.vue           # 错误页面

server/                 # Nitro 服务端
├── api/                # API 路由（RESTful）
└── utils/              # 服务端工具函数

sdk/                    # 自研 SDK（如 tracker）
```

### 关键约定

- **自动导入**：`components/`、`composables/`、`utils/` 下的文件自动导入，无需 import
- **客户端专用**：文件名加 `.client.vue` / `.client.ts` 跳过 SSR（AI 组件必须用）
- **路由中间件**：`middleware/auth.ts`（需登录）、`middleware/guest.ts`（已登录重定向）
- **渲染策略**：首页/商店/博客用 SSR，AI 对话用 CSR Only

## 2. 数据获取模式

### API 请求封装

```typescript
// composables/api/ 目录下的标准请求模式
export const useProductApi = () => {
  const { $api } = useNuxtApp() // 或直接使用 useFetch

  const getProducts = (categoryId: string) =>
    useFetch(`/api/v1/product/category/${categoryId}/products`, {
      baseURL: useRuntimeConfig().public.apiBase,
    })

  return { getProducts }
}
```

### SSR 数据获取

```typescript
// pages/ 中使用 useAsyncData + composable
const { data: products, pending } = await useAsyncData(
  'products',
  () => useProductApi().getProducts(categoryId),
  { watch: [categoryId] }
)
```

### BFF 内网直连

```typescript
// server/api/ 中直连后端服务，不走 Nginx
const config = useRuntimeConfig()
const res = await $fetch(`${config.apiSecretBase}/api/products`, {
  headers: { 'X-Internal-Token': config.apiSecret }
})
```

### Mock 数据

- `NUXT_PUBLIC_USE_MOCK=true` 时走 `server/api/mock/` 路由
- Mock 路由结构与真实 API 保持一致

## 3. 状态管理

### Pinia Store（`app/stores/`）

```typescript
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)

  async function login(credentials: LoginPayload) { /* ... */ }
  function logout() { /* ... */ }

  return { user, isLoggedIn, login, logout }
}, { persist: true }) // 持久化到 localStorage
```

### 何时用 Pinia vs useState

| 场景 | 选择 |
|------|------|
| 跨页面共享 + 需要 actions | Pinia Store |
| SSR 安全的简单状态共享 | `useState` |
| 组件内部状态 | `ref` / `reactive` |

## 4. 组件开发规范

### Vue SFC 结构

```vue
<script setup lang="ts">
// 1. Props & Emits 定义
const props = defineProps<{
  title: string
  items?: Item[]
}>()
const emit = defineEmits<{
  select: [item: Item]
}>()

// 2. Composables 调用
const { data, pending } = await useAsyncData(...)

// 3. 响应式状态
const isActive = ref(false)

// 4. 计算属性
const filteredItems = computed(() => ...)

// 5. 方法
function handleSelect(item: Item) { emit('select', item) }

// 6. 生命周期
onMounted(() => { ... })
</script>

<template>
  <!-- 模板 -->
</template>

<style scoped>
/* 仅必要时使用 scoped style，优先用 UnoCSS */
</style>
```

### 组件命名

- PascalCase 文件名：`ProductCard.vue`、`AppNavbarLayout.vue`
- 客户端组件：`AiCompanion.client.vue`
- 按功能分目录：`components/product/`、`components/home/`

## 5. 样式方案

### 优先级

1. **UnoCSS 原子类**（首选）：`class="flex items-center gap-4 text-sm"`
2. **UnoCSS shortcuts**（复用模式）：`class="section-container"` / `class="badge-green"`
3. **Nuxt UI 组件**：`<UButton>`、`<UIcon>`、`<UMarquee>`
4. **Scoped CSS**（仅复杂动画/伪元素）

### 主题适配

```html
<!-- 使用 dark: 前缀 -->
<div class="bg-white dark:bg-[#121417] text-black dark:text-white">
```

### 自定义色彩 Token

通过 `uno.config.ts` 的 `theme.colors` 扩展，使用 `text-home-accent`、`bg-card-dark` 等。

## 6. 性能优化

### 代码分割

- 页面自动按路由分割
- 大型组件使用 `defineAsyncComponent` 懒加载
- GSAP 等库使用 `.client.ts` 插件，仅客户端加载

### 图片优化

- 使用 Nuxt Image 或原生 `<img>` + `loading="lazy"`
- 公共图片放 `public/images/`

### Bundle 优化

```typescript
// nuxt.config.ts
vite: {
  optimizeDeps: {
    include: ['gsap', 'gsap/ScrollTrigger'] // 预构建
  }
}
```

### SSR 注意事项

- 避免在 `setup` 中直接访问 `window` / `document`
- 使用 `import.meta.client` 守卫浏览器 API
- `.client.vue` 组件不参与 SSR

## 7. 类型安全

```typescript
// types/ 目录定义共享类型
export interface Product {
  id: string
  name: string
  price: number
  images: string[]
}

// composables 中使用泛型
const { data } = await useFetch<Product[]>('/api/products')
```

- 开启 `typescript.strict: true`（已配置）
- Props 使用 `defineProps<T>()` 泛型形式
- API 返回值始终定义类型

## 8. 错误处理

```typescript
// 统一错误处理模式
const { data, error } = await useFetch('/api/products')
if (error.value) {
  useToast().add({ title: '加载失败', description: error.value.message, color: 'error' })
}
```

- 使用 `useToast()` 显示用户可见的错误
- 关键错误上报 Sentry（已集成 `@sentry/vue`）
- 服务端错误通过 Nitro 的 `createError` 抛出

## 9. 开发检查清单

编写新功能时，逐项确认：

- [ ] 遵循目录约定，文件放在正确位置
- [ ] 使用自动导入，不写多余 import
- [ ] SSR 安全：无浏览器 API 泄漏
- [ ] TypeScript 严格模式通过
- [ ] UnoCSS 优先，避免内联 style
- [ ] 响应式 + 双主题测试
- [ ] 错误处理完整（API 失败、边界情况）
- [ ] 性能：大数据列表考虑虚拟滚动或分页
