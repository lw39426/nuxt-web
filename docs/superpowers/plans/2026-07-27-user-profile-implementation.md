# 用户个人中心页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为已登录用户提供个人中心页面，包含 7 个功能模块（个人资料、我的订单、我的收藏、地址管理、浏览历史、我的评论、账号安全），采用侧边栏布局 + 嵌套子路由。

**Architecture:** Nuxt 3 嵌套路由，`pages/profile.vue` 作为布局页包含侧边栏和 `<NuxtPage />`，每个模块为独立子页面。导航栏适配登录态（头像 + 下拉菜单）。无接口模块使用 Nuxt server mock 数据。

**Tech Stack:** Nuxt 3, Vue 3 Composition API, TypeScript, Nuxt UI, Pinia, Tailwind CSS

## Global Constraints

- 使用项目现有模式：`useApi` composable、Pinia stores、`ApiResponse<T>` 包装
- UI 文案使用中文
- 支持暗色模式（`dark:` 前缀）
- 响应式：`>= 768px` 侧边栏布局，`< 768px` 顶部 Tab 栏
- 三态 UI：Loading / Error / Empty
- 无接口模块使用 `server/api/` mock，数据格式与真实接口一致
- 路由守卫：未登录弹登录弹窗
- 不提交 git（用户要求）

---

## Task 1: 路由框架 + 布局页 + 侧边栏组件

**Files:**
- Create: `app/pages/profile.vue`
- Create: `app/pages/profile/index.vue`
- Create: `app/components/ProfileSidebar.vue`

**Interfaces:**
- Consumes: `useAuthStore` (isAuthenticated, user), `useUiStore` (openAuthModal)
- Produces: `ProfileSidebar` 组件（props: 无，内部读取 store 和 route）

- [ ] **Step 1: 创建布局页 `app/pages/profile.vue`**

```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const uiStore = useUiStore()
</script>

<template>
  <div class="bg-white dark:bg-black min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div class="flex flex-col md:flex-row gap-6 lg:gap-8">
        <!-- 侧边栏 -->
        <aside class="w-full md:w-64 shrink-0">
          <ProfileSidebar />
        </aside>
        <!-- 右侧内容区 -->
        <main class="flex-1 min-w-0">
          <NuxtPage />
        </main>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 创建重定向页 `app/pages/profile/index.vue`**

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

onMounted(() => {
  navigateTo('/profile/account', { replace: true })
})
</script>

<template>
  <div class="flex items-center justify-center py-20">
    <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
  </div>
</template>
```

- [ ] **Step 3: 创建侧边栏组件 `app/components/ProfileSidebar.vue`**

```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()

interface MenuItem {
  name: string
  icon: string
  path: string
}

const menuItems: MenuItem[] = [
  { name: '个人资料', icon: 'i-carbon-user', path: '/profile/account' },
  { name: '我的订单', icon: 'i-carbon-package', path: '/profile/orders' },
  { name: '我的收藏', icon: 'i-carbon-favorite', path: '/profile/favorites' },
  { name: '地址管理', icon: 'i-carbon-location', path: '/profile/addresses' },
  { name: '浏览历史', icon: 'i-carbon-time', path: '/profile/history' },
  { name: '我的评论', icon: 'i-carbon-chat', path: '/profile/comments' },
  { name: '账号安全', icon: 'i-carbon-security', path: '/profile/security' }
]

const isActive = (path: string) => route.path === path

const displayName = computed(() => authStore.user?.username || '用户')
const displayAvatar = computed(() => '')
const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase())

const handleLogout = () => {
  authStore.clearAuth()
  navigateTo('/')
}
</script>

<template>
  <div class="md:sticky md:top-24">
    <!-- 用户信息卡片 -->
    <div class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 mb-4">
      <div
        class="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0"
      >
        {{ avatarLetter }}
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-gray-900 dark:text-white truncate">{{ displayName }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">普通会员</p>
      </div>
    </div>

    <!-- 菜单列表 -->
    <nav class="space-y-1">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        :class="
          isActive(item.path)
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        "
      >
        <span :class="[item.icon, 'w-5 h-5']" />
        {{ item.name }}
      </NuxtLink>
    </nav>

    <!-- 移动端退出登录 -->
    <button
      class="md:hidden mt-6 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
      @click="handleLogout"
    >
      <span class="i-carbon-logout w-5 h-5" />
      退出登录
    </button>
  </div>
</template>
```

- [ ] **Step 4: 验证路由框架**

Run: `pnpm dev`，访问 `/profile`，确认：
- 未登录时弹出登录弹窗
- 登录后显示侧边栏 + 空白内容区
- 点击侧边栏菜单跳转对应路由

Expected: 路由框架正常工作

---

## Task 2: 导航栏登录态适配

**Files:**
- Modify: `app/components/AppNavbarLayout.vue`

**Interfaces:**
- Consumes: `useAuthStore` (isAuthenticated, user)
- Produces: 导航栏头像下拉菜单

- [ ] **Step 1: 修改 `app/components/AppNavbarLayout.vue` — 添加登录态逻辑和头像下拉菜单**

在 `<script setup>` 顶部添加：

```ts
import { useAuthStore } from '~/stores/auth'
import { ref } from 'vue'

const authStore = useAuthStore()
const isDropdownOpen = ref(false)

const displayName = computed(() => authStore.user?.username || '用户')
const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase())

const handleLogout = () => {
  authStore.clearAuth()
  isDropdownOpen.value = false
  navigateTo('/')
}
```

- [ ] **Step 2: 替换模板中右侧按钮区域**

将模板中 `<!-- 右侧 Sign In 按钮 -->` 整个 `<div class="flex items-center gap-2 shrink-0">` 替换为：

```vue
<!-- 右侧区域 -->
<div class="flex items-center gap-2 shrink-0">
  <!-- 未登录：登录按钮 -->
  <button
    v-if="!authStore.isAuthenticated"
    type="button"
    class="h-8 items-center justify-center relative mr-2 group hidden md:flex pl-4"
    @click="openAuthModal('login')"
  >
    <div class="flex gap-2 items-center relative z-20 text-sm font-medium text-black-900 dark:text-white">
      <span class="mr-2">登 录</span>
      <!-- ... 原有 svg ... -->
    </div>
    <span class="h-8 pointer-events-none z-10 w-8 group-hover:w-[120%] transition-all duration-300 absolute top-0 -right-2 bg-neutral-200 dark:bg-white/10 rounded-full" />
  </button>

  <!-- 已登录：头像下拉菜单 -->
  <div v-else class="relative hidden md:block">
    <button
      type="button"
      class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-blue-300 transition-all"
      @click="isDropdownOpen = !isDropdownOpen"
    >
      {{ avatarLetter }}
    </button>

    <!-- 下拉菜单 -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 z-50"
      >
        <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ displayName }}</p>
        </div>
        <NuxtLink
          to="/profile/account"
          class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          @click="isDropdownOpen = false"
        >
          <span class="i-carbon-user w-4 h-4" />
          个人中心
        </NuxtLink>
        <NuxtLink
          to="/profile/orders"
          class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          @click="isDropdownOpen = false"
        >
          <span class="i-carbon-package w-4 h-4" />
          我的订单
        </NuxtLink>
        <button
          class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
          @click="handleLogout"
        >
          <span class="i-carbon-logout w-4 h-4" />
          退出登录
        </button>
      </div>
    </Transition>

    <!-- 点击外部关闭 -->
    <div v-if="isDropdownOpen" class="fixed inset-0 z-40" @click="isDropdownOpen = false" />
  </div>

  <!-- 移动端菜单按钮（保持不变） -->
  <UButton
    class="md:hidden rounded-full"
    variant="ghost"
    color="neutral"
    :icon="isMobileMenuOpen ? 'i-carbon-close' : 'i-carbon-menu'"
    @click="isMobileMenuOpen = !isMobileMenuOpen"
  />
</div>
```

- [ ] **Step 3: 验证导航栏**

登录后刷新页面，确认：
- 桌面端显示头像圆形按钮
- 点击展开下拉菜单（个人中心/我的订单/退出登录）
- 点击外部区域关闭菜单
- 移动端仍显示原有菜单按钮

---

## Task 3: 个人资料模块

**Files:**
- Create: `app/pages/profile/account.vue`

**Interfaces:**
- Consumes: `useUserApi` (getInfo, updateInfo)
- Produces: 个人资料页面

- [ ] **Step 1: 创建 `app/pages/profile/account.vue`**

```vue
<script setup lang="ts">
import { useUserApi } from '~/composables/api/user'

const { getInfo, updateInfo } = useUserApi()

const isLoading = ref(true)
const isEditing = ref(false)
const isSaving = ref(false)
const error = ref(false)

const form = ref({
  nickname: '',
  username: '',
  gender: 0,
  birthday: '',
  description: ''
})

const loadProfile = async () => {
  isLoading.value = true
  error.value = false
  try {
    const data = await getInfo()
    if (data) {
      form.value = {
        nickname: data.nickname || '',
        username: data.username || '',
        gender: data.gender || 0,
        birthday: data.birthday || '',
        description: data.description || ''
      }
    }
  } catch (err) {
    error.value = true
  } finally {
    isLoading.value = false
  }
}

const handleSave = async () => {
  isSaving.value = true
  try {
    await updateInfo({
      nickname: form.value.nickname || undefined,
      gender: form.value.gender || undefined,
      birthday: form.value.birthday || undefined,
      description: form.value.description || undefined
    })
    isEditing.value = false
    const toast = useToast()
    toast.add({ id: 'profile-save-success', title: '保存成功', color: 'success' })
  } catch (err: any) {
    const toast = useToast()
    toast.add({ id: 'profile-save-error', title: '保存失败', description: err.message || '请稍后再试', color: 'error' })
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  isEditing.value = false
  loadProfile()
}

onMounted(loadProfile)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">个人资料</h1>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadProfile">重试</UButton>
    </div>

    <!-- Content -->
    <div v-else class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
      <!-- 展示模式 -->
      <div v-if="!isEditing" class="space-y-4">
        <div class="flex justify-end">
          <UButton color="primary" variant="outline" size="sm" @click="isEditing = true">
            <span class="i-carbon-edit w-4 h-4 mr-1" />
            编辑
          </UButton>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">用户名</p>
            <p class="text-gray-900 dark:text-white">{{ form.username || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">昵称</p>
            <p class="text-gray-900 dark:text-white">{{ form.nickname || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">性别</p>
            <p class="text-gray-900 dark:text-white">
              {{ ['保密', '男', '女'][form.gender] || '保密' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">生日</p>
            <p class="text-gray-900 dark:text-white">{{ form.birthday || '-' }}</p>
          </div>
          <div class="sm:col-span-2">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">简介</p>
            <p class="text-gray-900 dark:text-white">{{ form.description || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- 编辑模式 -->
      <form v-else class="space-y-4" @submit.prevent="handleSave">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">用户名</label>
            <input
              :value="form.username"
              disabled
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 text-sm text-gray-500 dark:text-gray-400"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">昵称</label>
            <input
              v-model="form.nickname"
              type="text"
              placeholder="请输入昵称"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">性别</label>
            <select
              v-model="form.gender"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none"
            >
              <option :value="0">保密</option>
              <option :value="1">男</option>
              <option :value="2">女</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">生日</label>
            <input
              v-model="form.birthday"
              type="date"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">简介</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="介绍一下自己吧"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <UButton color="neutral" variant="outline" :disabled="isSaving" @click="handleCancel">
            取消
          </UButton>
          <UButton color="primary" type="submit" :loading="isSaving">
            保存
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证个人资料模块**

访问 `/profile/account`，确认：
- 加载状态显示 spinner
- 展示模式正确显示用户信息
- 点击编辑进入编辑模式
- 保存成功显示 toast
- 取消恢复原数据

---

## Task 4: 我的订单模块

**Files:**
- Create: `app/pages/profile/orders.vue`

**Interfaces:**
- Consumes: `useOrderApi` (list)
- Produces: 我的订单页面

- [ ] **Step 1: 创建 `app/pages/profile/orders.vue`**

```vue
<script setup lang="ts">
import { useOrderApi } from '~/composables/api/order'
import type { OrderBrief, OrderStatus } from '~/composables/api/order'

const { list } = useOrderApi()

const isLoading = ref(true)
const error = ref(false)
const orders = ref<OrderBrief[]>([])
const activeTab = ref<OrderStatus | 'all'>('all')

const tabs: { label: string; value: OrderStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 0 },
  { label: '已支付', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
]

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  0: { label: '待付款', color: 'text-orange-500' },
  1: { label: '已支付', color: 'text-blue-500' },
  2: { label: '已发货', color: 'text-purple-500' },
  3: { label: '已完成', color: 'text-green-500' },
  4: { label: '已取消', color: 'text-gray-400' }
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter((o) => o.status === activeTab.value)
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const loadOrders = async () => {
  isLoading.value = true
  error.value = false
  try {
    const data = await list()
    orders.value = data?.orders || []
  } catch (err) {
    error.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrders)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">我的订单</h1>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 overflow-x-auto pb-2 no-scrollbar">
      <button
        v-for="tab in tabs"
        :key="String(tab.value)"
        class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
        :class="
          activeTab === tab.value
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadOrders">重试</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredOrders.length === 0" class="text-center py-20">
      <div class="i-carbon-package text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500">暂无订单</p>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-6"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500 dark:text-gray-400">订单号：{{ order.order_no }}</span>
          <span :class="[statusMap[order.status].color, 'text-sm font-medium']">
            {{ statusMap[order.status].label }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">{{ formatDate(order.created_at) }}</span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            ¥{{ order.total_amount.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
```

- [ ] **Step 2: 验证订单模块**

访问 `/profile/orders`，确认：
- Tab 切换正常
- 订单列表正确显示
- 空状态正常

---

## Task 5: 我的收藏模块

**Files:**
- Create: `app/pages/profile/favorites.vue`

**Interfaces:**
- Consumes: `useFavoriteApi` (list), `ProductCard`, `BlogCard`
- Produces: 我的收藏页面

- [ ] **Step 1: 创建 `app/pages/profile/favorites.vue`**

```vue
<script setup lang="ts">
import { useFavoriteApi } from '~/composables/api/favorite'
import ProductCard from '~/components/product/ProductCard.vue'
import BlogCard from '~/components/BlogCard.vue'
import type { FavoriteItem } from '~/composables/api/favorite'
import type { BlogPost } from '~/types/blog'

const { list } = useFavoriteApi()

const isLoading = ref(true)
const error = ref(false)
const activeTab = ref<'product' | 'article'>('product')
const favorites = ref<FavoriteItem[]>([])

const productFavorites = computed(() => favorites.value.filter((f) => f.item_type === 'product'))
const articleFavorites = computed(() => favorites.value.filter((f) => f.item_type === 'article'))

const articleToBlogPost = (item: FavoriteItem): BlogPost => ({
  id: item.item_id,
  code: String(item.item_id),
  title: item.item_title,
  excerpt: item.item_description,
  category: '',
  image: item.item_image,
  date: '',
  author: { name: '', role: '', avatar: '' }
})

const loadFavorites = async () => {
  isLoading.value = true
  error.value = false
  try {
    const data = await list()
    favorites.value = data?.favorites || []
  } catch (err) {
    error.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadFavorites)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">我的收藏</h1>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6">
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'product'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        "
        @click="activeTab = 'product'"
      >
        商品 ({{ productFavorites.length }})
      </button>
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'article'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        "
        @click="activeTab = 'article'"
      >
        文章 ({{ articleFavorites.length }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadFavorites">重试</UButton>
    </div>

    <!-- Empty -->
    <div
      v-else-if="(activeTab === 'product' ? productFavorites : articleFavorites).length === 0"
      class="text-center py-20"
    >
      <div class="i-carbon-favorite text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500">暂无收藏</p>
    </div>

    <!-- Product Grid -->
    <div v-else-if="activeTab === 'product'" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <ProductCard
        v-for="item in productFavorites"
        :key="item.item_id"
        :product="{ id: item.item_id, name: item.item_title, main_image: item.item_image, price: 0, salePrice: 0, tags: [], images: [] }"
      />
    </div>

    <!-- Article List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BlogCard
        v-for="item in articleFavorites"
        :key="item.item_id"
        :blog-post="articleToBlogPost(item)"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证收藏模块**

访问 `/profile/favorites`，确认：
- Tab 切换正常
- 商品/文章列表正确显示
- 空状态正常

---

## Task 6: 地址管理模块

**Files:**
- Create: `app/pages/profile/addresses.vue`

**Interfaces:**
- Consumes: `useAddressApi` (list, create, update, remove, setDefault)
- Produces: 地址管理页面

- [ ] **Step 1: 创建 `app/pages/profile/addresses.vue`**

```vue
<script setup lang="ts">
import { useAddressApi } from '~/composables/api/address'
import type { Address, AddressPayload } from '~/composables/api/address'

const { list, create, update, remove, setDefault } = useAddressApi()

const isLoading = ref(true)
const error = ref(false)
const addresses = ref<Address[]>([])
const showModal = ref(false)
const editingAddress = ref<Address | null>(null)
const isSaving = ref(false)

const form = ref<AddressPayload>({
  recipient_name: '',
  phone: '',
  address_line: '',
  is_default: false
})

const loadAddresses = async () => {
  isLoading.value = true
  error.value = false
  try {
    const data = await list()
    addresses.value = data || []
  } catch (err) {
    error.value = true
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  editingAddress.value = null
  form.value = { recipient_name: '', phone: '', address_line: '', is_default: false }
  showModal.value = true
}

const openEditModal = (address: Address) => {
  editingAddress.value = address
  form.value = {
    recipient_name: address.recipient_name,
    phone: address.phone,
    address_line: address.address_line,
    is_default: address.is_default
  }
  showModal.value = true
}

const handleSubmit = async () => {
  isSaving.value = true
  try {
    if (editingAddress.value) {
      await update(editingAddress.value.id, form.value)
    } else {
      await create(form.value)
    }
    showModal.value = false
    await loadAddresses()
  } catch (err: any) {
    const toast = useToast()
    toast.add({ id: 'address-save-error', title: '保存失败', description: err.message || '请稍后再试', color: 'error' })
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('确定删除该地址？')) return
  try {
    await remove(id)
    await loadAddresses()
  } catch (err: any) {
    const toast = useToast()
    toast.add({ id: 'address-delete-error', title: '删除失败', description: err.message || '请稍后再试', color: 'error' })
  }
}

const handleSetDefault = async (id: number) => {
  try {
    await setDefault(id)
    await loadAddresses()
  } catch (err: any) {
    const toast = useToast()
    toast.add({ id: 'address-default-error', title: '设置失败', description: err.message || '请稍后再试', color: 'error' })
  }
}

onMounted(loadAddresses)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">地址管理</h1>
      <UButton color="primary" size="sm" @click="openCreateModal">
        <span class="i-carbon-add w-4 h-4 mr-1" />
        新增地址
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadAddresses">重试</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="addresses.length === 0" class="text-center py-20">
      <div class="i-carbon-location text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">暂无收货地址</p>
      <UButton color="primary" variant="outline" @click="openCreateModal">添加地址</UButton>
    </div>

    <!-- Address List -->
    <div v-else class="space-y-4">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="font-medium text-gray-900 dark:text-white">{{ address.recipient_name }}</span>
              <span class="text-sm text-gray-500">{{ address.phone }}</span>
              <span
                v-if="address.is_default"
                class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              >
                默认
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ address.address_line }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0 ml-4">
            <UButton
              v-if="!address.is_default"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="handleSetDefault(address.id)"
            >
              设为默认
            </UButton>
            <UButton color="neutral" variant="ghost" size="xs" @click="openEditModal(address)">
              编辑
            </UButton>
            <UButton color="error" variant="ghost" size="xs" @click="handleDelete(address.id)">
              删除
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UModal v-model="showModal">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ editingAddress ? '编辑地址' : '新增地址' }}
        </h3>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">收件人</label>
            <input
              v-model="form.recipient_name"
              type="text"
              required
              placeholder="请输入收件人姓名"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">手机号</label>
            <input
              v-model="form.phone"
              type="tel"
              required
              placeholder="请输入手机号"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">详细地址</label>
            <textarea
              v-model="form.address_line"
              required
              rows="2"
              placeholder="请输入详细地址"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="form.is_default"
              type="checkbox"
              id="is-default"
              class="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label for="is-default" class="text-sm text-gray-600 dark:text-gray-400">设为默认地址</label>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <UButton color="neutral" variant="outline" :disabled="isSaving" @click="showModal = false">
              取消
            </UButton>
            <UButton color="primary" type="submit" :loading="isSaving">
              保存
            </UButton>
          </div>
        </form>
      </div>
    </UModal>
  </div>
</template>
```

- [ ] **Step 2: 验证地址管理模块**

访问 `/profile/addresses`，确认：
- 地址列表显示
- 新增/编辑弹窗正常
- 删除确认正常
- 设默认正常

---

## Task 7: 我的评论模块

**Files:**
- Create: `app/pages/profile/comments.vue`

**Interfaces:**
- Consumes: `useCommentApi` (getByUser, remove), `useAuthStore` (user.id)
- Produces: 我的评论页面

- [ ] **Step 1: 创建 `app/pages/profile/comments.vue`**

```vue
<script setup lang="ts">
import { useCommentApi } from '~/composables/api/comment'
import { useAuthStore } from '~/stores/auth'
import type { Comment } from '~/types/blog'

const { getByUser, remove } = useCommentApi()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref(false)
const comments = ref<Comment[]>([])

const loadComments = async () => {
  isLoading.value = true
  error.value = false
  try {
    const userId = authStore.user?.id
    if (!userId) return
    const data = await getByUser(userId)
    comments.value = data?.comments || []
  } catch (err) {
    error.value = true
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('确定删除该评论？')) return
  try {
    await remove(id)
    await loadComments()
  } catch (err: any) {
    const toast = useToast()
    toast.add({ id: 'comment-delete-error', title: '删除失败', description: err.message || '请稍后再试', color: 'error' })
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(loadComments)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">我的评论</h1>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadComments">重试</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="comments.length === 0" class="text-center py-20">
      <div class="i-carbon-chat text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500">暂无评论</p>
    </div>

    <!-- Comment List -->
    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white mb-2">{{ comment.content }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span>{{ formatDate(comment.created_at) }}</span>
              <span v-if="comment.like_count">👍 {{ comment.like_count }}</span>
            </div>
          </div>
          <UButton color="error" variant="ghost" size="xs" @click="handleDelete(comment.id)">
            删除
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证评论模块**

访问 `/profile/comments`，确认：
- 评论列表显示
- 删除功能正常
- 空状态正常

---

## Task 8: 账号安全模块 + 登录记录 mock

**Files:**
- Create: `app/pages/profile/security.vue`
- Create: `server/api/user/login-records.get.ts`

**Interfaces:**
- Consumes: `useUserApi` (updatePassword), `$fetch` (login-records mock)
- Produces: 账号安全页面、登录记录 mock 端点

- [ ] **Step 1: 创建登录记录 mock `server/api/user/login-records.get.ts`**

```ts
import type { ApiResponse } from '~/types/api'

interface LoginRecord {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  current: boolean
  loginAt: string
}

export default defineEventHandler(() => {
  const mockData: LoginRecord[] = [
    {
      id: '1',
      device: 'Windows',
      browser: 'Chrome 120',
      location: '中国 广东省',
      ip: '192.168.1.***',
      current: true,
      loginAt: '2026-07-27 10:30:00'
    },
    {
      id: '2',
      device: 'iPhone',
      browser: 'Safari',
      location: '中国 广东省',
      ip: '192.168.1.***',
      current: false,
      loginAt: '2026-07-26 18:20:00'
    }
  ]

  return {
    code: 200,
    message: 'success',
    data: mockData
  } satisfies ApiResponse<LoginRecord[]>
})
```

- [ ] **Step 2: 创建 `app/pages/profile/security.vue`**

```vue
<script setup lang="ts">
import { useUserApi } from '~/composables/api/user'

const { updatePassword } = useUserApi()

const isSaving = ref(false)
const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const loginRecords = ref<any[]>([])
const isLoadingRecords = ref(true)

const loadLoginRecords = async () => {
  isLoadingRecords.value = true
  try {
    const data = await $fetch('/api/user/login-records')
    loginRecords.value = data?.data || []
  } catch (err) {
    console.error('Failed to load login records:', err)
  } finally {
    isLoadingRecords.value = false
  }
}

const handleChangePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    const toast = useToast()
    toast.add({ id: 'pwd-mismatch', title: '两次输入的密码不一致', color: 'error' })
    return
  }
  isSaving.value = true
  try {
    await updatePassword({
      old_password: passwordForm.value.old_password,
      new_password: passwordForm.value.new_password
    })
    const toast = useToast()
    toast.add({ id: 'pwd-change-success', title: '密码修改成功', color: 'success' })
    passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }
  } catch (err: any) {
    const toast = useToast()
    toast.add({ id: 'pwd-change-error', title: '修改失败', description: err.message || '请稍后再试', color: 'error' })
  } finally {
    isSaving.value = false
  }
}

onMounted(loadLoginRecords)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">账号安全</h1>

    <div class="space-y-8">
      <!-- 修改密码 -->
      <section class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">修改密码</h2>
        <form class="space-y-4 max-w-md" @submit.prevent="handleChangePassword">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">当前密码</label>
            <input
              v-model="passwordForm.old_password"
              type="password"
              required
              placeholder="请输入当前密码"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">新密码</label>
            <input
              v-model="passwordForm.new_password"
              type="password"
              required
              placeholder="请输入新密码"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">确认新密码</label>
            <input
              v-model="passwordForm.confirm_password"
              type="password"
              required
              placeholder="请再次输入新密码"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <UButton color="primary" type="submit" :loading="isSaving">
            确认修改
          </UButton>
        </form>
      </section>

      <!-- 登录记录 -->
      <section class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">登录记录</h2>
        <div v-if="isLoadingRecords" class="flex justify-center py-10">
          <div class="i-carbon-circle-dash w-6 h-6 animate-spin text-gray-400" />
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="record in loginRecords"
            :key="record.id"
            class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
          >
            <div>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ record.device }} · {{ record.browser }}
                <span
                  v-if="record.current"
                  class="ml-2 text-xs px-2 py-0.5 rounded bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                >
                  当前设备
                </span>
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ record.location }} · {{ record.ip }}</p>
            </div>
            <span class="text-xs text-gray-400 shrink-0">{{ record.loginAt }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
```

- [ ] **Step 3: 验证账号安全模块**

访问 `/profile/security`，确认：
- 修改密码表单正常
- 密码不一致校验正常
- 登录记录 mock 数据正确显示

---

## Task 9: 浏览历史模块 + mock

**Files:**
- Create: `app/pages/profile/history.vue`
- Create: `server/api/user/history.get.ts`

**Interfaces:**
- Consumes: `$fetch` (history mock)
- Produces: 浏览历史页面、history mock 端点

- [ ] **Step 1: 创建浏览历史 mock `server/api/user/history.get.ts`**

```ts
import type { ApiResponse } from '~/types/api'

interface HistoryEntry {
  id: string
  type: 'product' | 'article'
  title: string
  image: string
  meta: string
  viewedAt: string
}

export default defineEventHandler(() => {
  const mockData: HistoryEntry[] = [
    {
      id: '1',
      type: 'product',
      title: 'OPPO Reno 12 Pro',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200',
      meta: '手机 · ¥3999',
      viewedAt: '2026-07-27 11:00:00'
    },
    {
      id: '2',
      type: 'article',
      title: '2026年最值得购买的智能手机推荐',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200',
      meta: '科技 · 5分钟阅读',
      viewedAt: '2026-07-27 09:30:00'
    },
    {
      id: '3',
      type: 'product',
      title: 'MacBook Pro 14英寸',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
      meta: '电脑 · ¥14999',
      viewedAt: '2026-07-26 20:15:00'
    }
  ]

  return {
    code: 200,
    message: 'success',
    data: mockData
  } satisfies ApiResponse<HistoryEntry[]>
})
```

- [ ] **Step 2: 创建 `app/pages/profile/history.vue`**

```vue
<script setup lang="ts">
interface HistoryEntry {
  id: string
  type: 'product' | 'article'
  title: string
  image: string
  meta: string
  viewedAt: string
}

const isLoading = ref(true)
const error = ref(false)
const history = ref<HistoryEntry[]>([])

const loadHistory = async () => {
  isLoading.value = true
  error.value = false
  try {
    const data = await $fetch('/api/user/history')
    history.value = data?.data || []
  } catch (err) {
    error.value = true
  } finally {
    isLoading.value = false
  }
}

const clearHistory = () => {
  if (!confirm('确定清空浏览历史？')) return
  history.value = []
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return '昨天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(loadHistory)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">浏览历史</h1>
      <UButton
        v-if="history.length > 0"
        color="neutral"
        variant="outline"
        size="sm"
        @click="clearHistory"
      >
        清空历史
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadHistory">重试</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="history.length === 0" class="text-center py-20">
      <div class="i-carbon-time text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500">暂无浏览记录</p>
    </div>

    <!-- History List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in history"
        :key="item.id"
        class="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <img
          :src="item.image"
          :alt="item.title"
          class="h-14 w-14 rounded-lg object-cover shrink-0"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ item.title }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ item.meta }}</p>
        </div>
        <span class="text-xs text-gray-400 shrink-0">{{ formatTime(item.viewedAt) }}</span>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: 验证浏览历史模块**

访问 `/profile/history`，确认：
- mock 数据正确显示
- 时间格式化正确
- 清空历史功能正常
- 空状态正常

---

## Task 10: 整体联调与响应式验证

**Files:** 无新增，验证所有模块

- [ ] **Step 1: 桌面端验证**

在 `>= 768px` 宽度下：
- 侧边栏固定在左侧
- 右侧内容区正确显示
- 导航栏头像下拉菜单正常
- 所有 7 个模块切换正常

- [ ] **Step 2: 移动端验证**

在 `< 768px` 宽度下：
- 侧边栏隐藏，内容区全宽
- 导航栏移动端菜单正常
- 各模块内容可读、可操作

- [ ] **Step 3: 路由守卫验证**

- 未登录访问 `/profile` → 弹出登录弹窗
- 登录后自动跳转到个人中心

---

## 执行说明

- 每个 Task 完成后可通过 `pnpm dev` 在浏览器中验证
- 项目使用 Nuxt UI 组件库（`UButton`, `UModal` 等）
- 所有 API 调用通过 `useApi` composable，错误处理已统一在 `handleError` 中
- Mock 数据格式遵循 `ApiResponse<T>` 包装（`{ code: 200, message: 'success', data: T }`）
