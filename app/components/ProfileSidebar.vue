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
    <!-- 用户信息区：头像底色引用皮肤实底渐变 -->
    <div class="flex items-center gap-3 px-5 py-5 mb-2">
      <div
        class="avatar h-14 w-14 rounded-full flex items-center justify-center text-canvas font-bold text-xl shrink-0"
      >
        {{ avatarLetter }}
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-fg text-base truncate">{{ displayName }}</p>
        <p class="text-xs text-fg-muted mt-0.5">普通会员</p>
      </div>
    </div>

    <!-- 导航菜单：选中态引用皮肤色 -->
    <nav class="flex-1 px-3 space-y-1">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ 'nav-item--on': isActive(item.path) }"
      >
        <!-- 选中态指示器 -->
        <span v-if="isActive(item.path)" class="nav-indicator" />
        <span :class="[item.icon, 'w-5 h-5']" />
        {{ item.name }}
      </NuxtLink>
    </nav>

    <!-- 皮肤快切：紧凑色卡（与悬浮菜单共享同一状态） -->
    <div class="px-4 pt-3 mx-3 mb-1 skin-block">
      <div class="skin-block-label">皮肤</div>
      <ProfileSkinSwitcher compact />
    </div>

    <!-- 底部帮助与退出 -->
    <div class="px-3 pb-4 mt-1 space-y-1">
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

<style scoped>
/* 头像：皮肤实底渐变 + 主色投影 */
.avatar {
  background: var(--skin-solid);
  box-shadow: var(--skin-solid-shadow);
  color: var(--skin-ink-on);
}

/* 菜单项：圆角胶囊，默认弱化文字 */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 2.75rem;
  padding: 0 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: var(--fg-muted);
  transition: all 0.2s ease;
}
.nav-item:hover {
  background: var(--skin-chip-hover);
  color: var(--skin-ink);
}

/* 选中态：皮肤淡底 + 主色描边文字 */
.nav-item--on {
  background: var(--skin-chip-bg);
  color: var(--skin-ink-strong);
  font-weight: 500;
  box-shadow: inset 0 0 0 1px var(--skin-chip-border);
}

/* 选中态指示器：左缘皮肤主色竖条 */
.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 1.25rem;
  border-radius: 0 999px 999px 0;
  background: var(--skin-accent);
}

/* 皮肤快切块：顶部细线与菜单区隔开 */
.skin-block {
  border-top: 1px solid var(--line);
}
.skin-block-label {
  margin-bottom: 0.5rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--fg-subtle);
}
</style>
