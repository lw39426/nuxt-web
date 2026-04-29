# Pinia 状态管理集成指南

## 概述

项目已成功集成 **Pinia** 作为官方状态管理库，与 Nuxt 4 深度集成，提供类型安全的状态管理。

## 安装完成的内容

✅ **已安装依赖**
- `pinia@^3.0.4` - 状态管理库
- Nuxt 已自动配置 Pinia 模块（在 `nuxt.config.ts` 中）

✅ **已创建的 Store 模块**

### 1. **Auth Store** (`app/stores/auth.ts`)
管理用户认证状态

```typescript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// 状态
authStore.token        // string | null
authStore.refreshToken // string | null
authStore.user        // AuthUser | null

// 计算属性
authStore.isAuthenticated // computed boolean

// 方法
authStore.setAuth({ token?, refreshToken?, user? })
authStore.clearAuth()
authStore.initAuthFromCookie()
```

### 2. **Theme Store** (`app/stores/theme.ts`)
管理主题模式（system/light/dark）

```typescript
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

// 状态
themeStore.mode // 'system' | 'light' | 'dark'

// 方法
themeStore.setMode(value: ThemeMode)
```

### 3. **UI Store** (`app/stores/ui.ts`)
管理全局 UI 状态（模态框、侧边栏等）

```typescript
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// Auth Modal 状态
uiStore.authModalOpen   // boolean
uiStore.authModalView   // 'login' | 'register'

// Auth Modal 方法
uiStore.openAuthModal(view: 'login' | 'register')
uiStore.closeAuthModal()
```

## 已更新的文件

### 组件
- ✅ `app/app.vue` - 使用 `useUiStore`
- ✅ `app/components/AppFloatingMenu.vue` - 使用 `useThemeStore`
- ✅ `app/components/AppNavbarLayout.vue` - 使用 `useUiStore`
- ✅ `app/components/AuthModal.vue` - 使用 `useAuthStore` 和 `useUiStore`

### 中间件
- ✅ `app/middleware/auth.ts` - 使用 `useAuthStore` 和 `useUiStore`
- ✅ `app/middleware/guest.ts` - 使用 `useAuthStore`

### 插件
- ✅ `app/plugins/theme.client.ts` - 使用 `useThemeStore`

### Composables
- ✅ `app/composables/useApi.ts` - 使用 `useAuthStore` 和 `useUiStore`

### 页面
- ✅ `app/pages/index.vue` - 使用 `useThemeStore`

## 使用示例

### 登录示例
```vue
<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const handleLogin = async (credentials) => {
  const response = await loginApi(credentials)
  authStore.setAuth({
    token: response.access_token,
    refreshToken: response.refresh_token,
    user: response.user
  })
}
</script>
```

### 检查认证状态
```vue
<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

if (authStore.isAuthenticated) {
  // 用户已登录
}
</script>
```

### 切换主题
```vue
<script setup>
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

const switchTheme = (mode) => {
  themeStore.setMode(mode) // 'light' | 'dark' | 'system'
}
</script>
```

### 打开认证模态框
```vue
<script setup>
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 打开登录
uiStore.openAuthModal('login')

// 打开注册
uiStore.openAuthModal('register')

// 关闭
uiStore.closeAuthModal()
</script>
```

## 数据持久化

### Auth Store
- **Token**: 存储在 Cookie (`auth_token`) 和内存中
- **RefreshToken**: 存储在 Cookie (`refresh_token`) 和内存中
- **User**: 存储在内存中

### Theme Store
- 主题选择存储在 `localStorage` (key: `theme-mode`)
- 应用启动时从 localStorage 恢复

## 最佳实践

### ✅ DO
- 在组件中使用 `const store = useXxxStore()` 获取 store 实例
- 使用 `computed` 或直接访问 store 的响应式属性
- 在模板中直接使用 `store.property` 或 `store.method()`
- 使用类型安全的状态访问

### ❌ DON'T
- 不要在 store 外部直接修改状态
- 不要导入并修改 store 内部的状态对象
- 不要在中间件中直接修改 Cookie（由 store 管理）

## 添加新的 Store

要添加新的 Store，遵循以下模式：

```typescript
// app/stores/myFeature.ts
import { defineStore } from 'pinia'

export const useMyFeatureStore = defineStore('myFeature', () => {
  // 状态
  const count = ref(0)
  
  // 计算属性
  const doubled = computed(() => count.value * 2)
  
  // 方法
  const increment = () => {
    count.value++
  }
  
  return {
    count,
    doubled,
    increment
  }
})
```

然后在组件中使用：

```typescript
import { useMyFeatureStore } from '~/stores/myFeature'

const store = useMyFeatureStore()
```

## 迁移指南

### 旧的 useState 方式 → Pinia Store

**之前（Composable）:**
```typescript
export function useAuthState() {
  const token = useState<string | null>('auth_token', () => null)
  // ...
}
```

**之后（Pinia）:**
```typescript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
authStore.token
```

## 故障排除

### Store 在中间件中无法工作
确保在 `import.meta.client` 检查后使用，或在适当的 hook 中初始化。

### 状态在页面刷新后丢失
- 检查是否正确持久化（Cookie/localStorage）
- 确保插件在应用启动时正确初始化

### TypeScript 错误
- 确保所有 store 导入都来自 `~/stores/` 目录
- 类型应该在 store 定义中导出
