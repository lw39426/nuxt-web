<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const props = defineProps<{
  coverUploading?: boolean;
}>();
const emit = defineEmits<{
  'change-cover': [];
}>();

const authStore = useAuthStore();
const route = useRoute();
const showSettings = shallowRef(false);

watch(
  () => route.path,
  () => {
    showSettings.value = false;
  }
);

interface MenuItem {
  name: string;
  icon: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { name: '个人资料', icon: 'i-carbon-user', path: '/profile/account' },
  { name: '消息中心', icon: 'i-carbon-chat', path: '/chat' },
  { name: '每日签到', icon: 'i-carbon-calendar', path: '/profile/checkin' },
  // { name: '我的订单', icon: 'i-carbon-package', path: '/profile/orders' },
  // { name: '地址管理', icon: 'i-carbon-location', path: '/profile/addresses' },
  { name: '我的收藏', icon: 'i-carbon-favorite', path: '/profile/favorites' },
  { name: '实用工具', icon: 'i-carbon-tool-box', path: '/profile/tools' },
  { name: '浏览历史', icon: 'i-carbon-time', path: '/profile/history' },
  { name: '我的评论', icon: 'i-carbon-chat', path: '/profile/comments' },
  { name: '账号安全', icon: 'i-carbon-security', path: '/profile/security' }
];

/**
 * 判断菜单项是否为当前激活路由
 * @param path 菜单项路径
 */
const isActive = (path: string) =>
  route.path === path || (path === '/profile/favorites' && route.path === '/profile/collection');

// 展示名优先取昵称（第三方登录），其次用户名，最后兜底「用户」
const displayName = computed(() => authStore.user?.nickname || authStore.user?.username || '用户');
const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase());
const profileCover = computed(() => authStore.user?.bg_cover || '');

/**
 * 退出登录：清空认证态并跳转首页
 */
const handleLogout = () => {
  authStore.clearAuth();
  navigateTo('/');
};
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 顶部留出封面展示区域，头像和资料叠放在横幅下方。 -->
    <div class="profile-identity">
      <button
        type="button"
        class="profile-cover"
        :style="profileCover ? { backgroundImage: `url(${profileCover})` } : undefined"
        :disabled="props.coverUploading"
        :aria-busy="props.coverUploading"
        aria-label="更换个人封面"
        @click="emit('change-cover')"
      >
        <span class="profile-cover-overlay" aria-hidden="true" />
        <span class="profile-cover-action">
          <span
            :class="props.coverUploading ? 'i-carbon-circle-dash animate-spin' : 'i-carbon-camera'"
            class="w-3.5 h-3.5"
            aria-hidden="true"
          />
          {{ props.coverUploading ? '上传中…' : '更换封面' }}
        </span>
      </button>
      <div class="profile-identity-content">
        <div
          class="avatar h-11 w-11 lg:h-14 lg:w-14 rounded-full flex items-center justify-center text-canvas font-bold text-xl shrink-0"
        >
          <UAvatar
            :src="authStore.user?.avatar || undefined"
            :text="avatarLetter"
            alt=""
            class="size-full bg-transparent"
            :ui="{ image: 'object-cover', fallback: 'text-inherit font-bold' }"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-fg text-base truncate">{{ displayName }}</p>
          <p class="text-xs text-fg-muted mt-0.5 truncate">
            {{ authStore.user?.username ? `@${authStore.user.username}` : '普通会员' }}
          </p>
        </div>
        <button
          type="button"
          class="settings-toggle lg:hidden"
          :aria-expanded="showSettings"
          aria-controls="profile-settings"
          @click="showSettings = !showSettings"
        >
          <span class="i-carbon-settings w-4 h-4" aria-hidden="true" />
          设置
          <span
            :class="showSettings ? 'i-carbon-chevron-up' : 'i-carbon-chevron-down'"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <!-- 导航菜单：选中态引用皮肤色 -->
    <nav class="profile-nav flex-1" aria-label="个人中心导航">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ 'nav-item--on': isActive(item.path) }"
        :aria-current="isActive(item.path) ? 'page' : undefined"
      >
        <!-- 选中态指示器 -->
        <span v-if="isActive(item.path)" class="nav-indicator" />
        <span :class="[item.icon, 'w-5 h-5 shrink-0']" aria-hidden="true" />
        {{ item.name }}
      </NuxtLink>
    </nav>

    <div id="profile-settings" :class="showSettings ? 'block' : 'hidden lg:block'">
      <!-- 底部帮助与退出 -->
      <div class="profile-footer space-y-1">
        <NuxtLink
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
  </div>
</template>

<style scoped>
.profile-nav {
  padding: 0 0.75rem;
}
.nav-item + .nav-item {
  margin-top: 0.25rem;
}
.settings-toggle {
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 44px;
  padding: 0 0.5rem;
  color: var(--fg-muted);
  font-size: 0.8125rem;
  border-radius: 0.75rem;
  pointer-events: auto;
}
.nav-item:focus-visible,
.settings-toggle:focus-visible {
  outline: 2px solid var(--skin-accent);
  outline-offset: 2px;
}
@media (max-width: 1023px) {
  .settings-toggle {
    display: flex;
  }
  .profile-nav {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.375rem;
    padding: 0 0.75rem 0.75rem;
  }
  .profile-nav .nav-item {
    flex-direction: column;
    justify-content: center;
    gap: 0.375rem;
    height: auto;
    min-height: 64px;
    margin: 0;
    padding: 0.5rem 0.125rem;
    font-size: 0.75rem;
  }
  .nav-indicator {
    display: none;
  }
}
/* 头像：皮肤实底渐变 + 主色投影 */
.avatar {
  background: var(--skin-solid);
  box-shadow: var(--skin-solid-shadow);
  color: var(--skin-ink-on);
}
.profile-identity {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  min-height: 10rem;
  margin-bottom: 0.75rem;
  padding: 5.5rem 1rem 1rem;
}
.profile-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 1rem 1rem 0.9rem 0.9rem;
  background-color: var(--skin-chip-bg);
  background-size: cover;
  background-position: center;
  cursor: pointer;
}
.profile-cover:disabled {
  cursor: wait;
}
.profile-cover:focus-visible {
  outline: 2px solid var(--skin-accent);
  outline-offset: -3px;
}
.profile-cover-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--surface) 18%, transparent),
    color-mix(in srgb, var(--surface) 62%, transparent) 55%,
    color-mix(in srgb, var(--surface) 94%, transparent)
  );
}
.profile-cover-action {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--fg-muted);
  font-size: 0.6875rem;
}
.profile-cover:hover .profile-cover-action {
  color: var(--skin-ink-strong);
  border-color: var(--skin-chip-border);
}
.profile-identity-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  pointer-events: none;
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

.profile-footer {
  margin: 0.75rem 0.75rem 0;
  padding: 0.5rem 0 1rem;
  border-top: 1px solid var(--line);
}
</style>
