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
  <div class="flex flex-col h-full">
    <!-- 用户信息区 -->
    <div class="flex items-center gap-3 px-5 py-5 mb-2">
      <div
        class="h-14 w-14 rounded-full bg-fg flex items-center justify-center text-canvas font-bold text-xl shrink-0"
      >
        {{ avatarLetter }}
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-fg text-base truncate">{{ displayName }}</p>
        <p class="text-xs text-fg-muted mt-0.5">普通会员</p>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 px-3 space-y-1">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="relative flex items-center gap-3 px-4 h-11 rounded-xl text-sm transition-colors duration-200"
        :class="
          isActive(item.path)
            ? 'bg-brand-soft text-brand font-medium'
            : 'text-fg-muted hover:bg-surface-muted'
        "
      >
        <!-- 选中态指示器 -->
        <span
          v-if="isActive(item.path)"
          class="absolute left-0 top-2/3 -translate-y-1/2 w-[3px] h-5 bg-brand rounded-r-full"
        />
        <span :class="[item.icon, 'w-5 h-5']" />
        {{ item.name }}
      </NuxtLink>
    </nav>

    <!-- 底部帮助与退出 -->
    <div class="px-3 pb-4 mt-4 space-y-1">
      <NuxtLink
        to="/help"
        class="flex items-center gap-3 px-4 h-11 rounded-xl text-xs text-fg-subtle hover:text-fg-muted transition-colors"
      >
        <span class="i-carbon-help w-4 h-4" />
        帮助与反馈
      </NuxtLink>
      <button
        class="flex items-center gap-3 px-4 h-11 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors"
        @click="handleLogout"
      >
        <span class="i-carbon-logout w-5 h-5" />
        退出登录
      </button>
    </div>
  </div>
</template>
