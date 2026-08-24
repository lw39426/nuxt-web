<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const route = useRoute();

interface MenuItem {
  name: string;
  icon: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { name: '个人资料', icon: 'i-carbon-user', path: '/profile/account' },
  { name: '我的订单', icon: 'i-carbon-package', path: '/profile/orders' },
  { name: '我的收藏', icon: 'i-carbon-favorite', path: '/profile/favorites' },
  { name: '地址管理', icon: 'i-carbon-location', path: '/profile/addresses' },
  { name: '浏览历史', icon: 'i-carbon-time', path: '/profile/history' },
  { name: '我的评论', icon: 'i-carbon-chat', path: '/profile/comments' },
  { name: '账号安全', icon: 'i-carbon-security', path: '/profile/security' }
];

const isActive = (path: string) => route.path === path;

const displayName = computed(() => authStore.user?.username || '用户');
const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase());

const handleLogout = () => {
  authStore.clearAuth();
  navigateTo('/');
};
</script>

<template>
  <div class="md:sticky md:top-24">
    <!-- 用户信息卡片 -->
    <div class="flex items-center gap-4 p-4 rounded-2xl bg-surface-muted mb-4">
      <div
        class="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0"
      >
        {{ avatarLetter }}
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-fg truncate">{{ displayName }}</p>
        <p class="text-xs text-fg-muted">普通会员</p>
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
            : 'text-fg-muted hover:bg-surface-muted'
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
