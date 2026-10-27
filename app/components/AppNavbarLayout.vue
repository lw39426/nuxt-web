<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useScrollLock } from '@vueuse/core';
import { useUiStore } from '~/stores/ui';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const uiStore = useUiStore();
const { openAuthModal } = uiStore;
const authStore = useAuthStore();

const isDropdownOpen = ref(false);
const dropdownWrapperRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const displayName = computed(() => authStore.user?.username || '用户');
const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase());

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value && dropdownWrapperRef.value) {
    const rect = dropdownWrapperRef.value.getBoundingClientRect();
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`,
      width: '192px'
    };
  }
};

const handleLogout = () => {
  authStore.clearAuth();
  isDropdownOpen.value = false;
  navigateTo('/');
};

// 菜单配置
const menuItems = [
  { name: 'Home', href: '/', icon: 'i-carbon-home' },
  { name: 'Products', href: '/products', icon: 'i-carbon-cube' },
  { name: 'Blog', href: '/blog', icon: 'i-carbon-blog' },
  { name: 'genshin', href: '/character/mondstadt', icon: 'i-carbon-pricing-consumption' },
  { name: 'About Us', href: '/about', icon: 'i-carbon-group' }
];

// 组件变量状态管理
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const sentinelRef = ref<HTMLElement | null>(null);

// 移动端目录展开时锁滚动，避免面板背后页面跟着滑动
const isScrollLocked = useScrollLock(import.meta.client ? document.documentElement : null);
watch(isMobileMenuOpen, (open) => {
  isScrollLocked.value = open;
  if (open) isDropdownOpen.value = false;
});

// 路由切换后目录面板必须收起（软导航复用同一组件实例）
watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
  }
);

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  isMobileMenuOpen.value = false;
  isDropdownOpen.value = false;
};

// 视口跨过 md 断点时面板被 CSS 隐藏，必须同步解锁滚动（横屏/旋转场景）
let desktopQuery: MediaQueryList | null = null;
const handleDesktopChange = (event: MediaQueryList | MediaQueryListEvent) => {
  if (event.matches) isMobileMenuOpen.value = false;
};

// IntersectionObserver 实例
let observer: IntersectionObserver | null = null;

/**
 * 哨兵元素可见性变化回调，驱动导航栏形态切换。
 * 仅切换 isScrolled 状态，视觉过渡完全交给 CSS transition：
 * 外层为 fixed 定位已脱离文档流，因此 max-width / padding 的过渡
 * 只重排导航栏自身子树，不会牵动整页 reflow，天然流畅且可中断。
 */
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  const entry = entries[0];
  if (!entry) return;

  // 强制胶囊态页面忽略滚动状态，恒定为胶囊
  isScrolled.value = route.meta.forceCapsule ? true : !entry.isIntersecting;
};

// 监听强制胶囊态的路由 meta 变化（同一组件在软导航间复用时）
watch(
  () => route.meta.forceCapsule,
  (newVal) => {
    if (newVal) {
      isScrolled.value = true;
    } else {
      // 退出强制胶囊：依据哨兵当前是否已滚出视口决定形态，避免停留在错误状态
      const el = sentinelRef.value;
      isScrolled.value = el ? el.getBoundingClientRect().bottom <= 0 : false;
    }
  }
);

onMounted(() => {
  // 强制胶囊态页面初始直接落位为胶囊
  if (route.meta.forceCapsule) {
    isScrolled.value = true;
  }

  // IntersectionObserver 监听哨兵，替代高频 scroll 事件，降低滚动开销。
  // observe 后会立即触发一次回调，天然完成初始状态落位（刷新时恢复滚动位置也不会抖动）
  observer = new IntersectionObserver(handleIntersection, {
    root: null,
    threshold: 0,
    rootMargin: '5px 0px 0px 0px'
  });

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }

  window.addEventListener('keydown', handleKeydown);
  desktopQuery = window.matchMedia('(min-width: 768px)');
  desktopQuery.addEventListener('change', handleDesktopChange);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  window.removeEventListener('keydown', handleKeydown);
  desktopQuery?.removeEventListener('change', handleDesktopChange);
  isScrollLocked.value = false;
});
</script>

<template>
  <!-- 占位元素：外层导航改为 fixed 后脱离文档流，此处在正常流中占据等高空间，
       将页面内容顶到导航下方（等效原 sticky 的占位行为）。强制胶囊态的沉浸式页面不占位。 -->
  <div v-if="!route.meta.forceCapsule" class="h-[60px] md:h-[80px]" aria-hidden="true"></div>

  <!-- 哨兵元素：位于文档流顶部，滚出视口即视为「已滚动」，由 IntersectionObserver 监听 -->
  <div
    ref="sentinelRef"
    class="absolute top-0 left-0 h-1 w-full pointer-events-none bg-transparent z-0"
  ></div>

  <!-- 外层容器：始终 fixed 悬浮。脱离文档流后，导航壳的宽度/内边距过渡只重排自身，
       不触发整页 reflow —— 这是流畅切换的关键（参考 LongCat 的实现思路）。 -->
  <div class="fixed top-0 left-0 right-0 z-50 w-full">
    <!-- 点击面板外关闭：只覆盖导航栏以下区域，不拦截栏内按钮。
         nav 因 translateZ(0) 是独立层叠上下文，面板的 z-10 无法越出它参与比较，
         故必须显式给 nav 指定高于遮罩 z-0 的层级，否则遮罩会盖住面板吃掉菜单点击 -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden fixed inset-x-0 top-[60px] bottom-0 z-0"
      aria-hidden="true"
      @click="isMobileMenuOpen = false"
    />

    <nav class="relative z-10 flex justify-center px-2 py-0 md:px-4 md:py-2">
      <!-- 导航壳：胶囊态 ⇄ 全宽态，纯 CSS transition 平滑过渡，天然可中断。
           形态样式统一由 scoped CSS 的 .nav-shell / .is-capsule 声明，
           避免 UnoCSS 同优先级工具类（如 max-w-3xl / max-w-7xl）互相覆盖导致状态错乱。 -->
      <div
        class="nav-shell w-full flex items-center justify-between px-6 py-2 md:px-8 md:py-2"
        :class="{ 'is-capsule': isScrolled }"
      >
        <!-- 内容层 -->
        <div class="flex items-center justify-between w-full">
          <!-- 左侧 Logo -->
          <div class="shrink-0">
            <a href="/" class="flex items-center gap-2">
              <div
                class="h-[40px] w-[60px] rounded-lg flex items-center justify-center overflow-hidden"
              >
                <!-- 双图显隐：SSR 与客户端首帧一致，避免水合 mismatch -->
                <img
                  src="/images/logo/youmi-logo-light-2048.png"
                  alt="YouMi Logo"
                  class="w-full h-full object-contain dark:hidden"
                />
                <img
                  src="/images/logo/youmi-logo-dark-2048.png"
                  alt="YouMi Logo"
                  class="w-full h-full object-contain hidden dark:block"
                />
              </div>
              <!-- <p class="font-bold font-display text-xl text-fg">YouMi</p> -->
            </a>
          </div>

          <!-- 中间菜单 (桌面端显示) -->
          <div class="items-center justify-center gap-1 hidden md:flex">
            <a
              v-for="item in menuItems"
              :key="item.name"
              :href="item.href"
              class="px-3 py-1.5 text-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-muted rounded-full transition-colors"
            >
              {{ item.name }}
            </a>
          </div>

          <!-- 右侧区域 -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- 未登录：登录按钮 -->
            <button
              v-if="!authStore.isAuthenticated"
              type="button"
              class="h-8 items-center justify-center relative mr-2 group hidden md:flex pl-4"
              @click="openAuthModal('login')"
            >
              <div class="flex gap-2 items-center relative z-20 text-sm font-medium text-fg">
                <span class="mr-2">登 录</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-arrow-right w-4 h-4"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
              <!-- 灰色圆形背景，Hover 时伸长 -->
              <span
                class="h-8 pointer-events-none z-10 w-8 group-hover:w-[120%] transition-all duration-300 absolute top-0 -right-2 bg-surface-muted rounded-full flex items-center justify-center"
              ></span>
            </button>

            <!-- 已登录：头像下拉菜单（移动端同样展示，保证登录态可见） -->
            <div
              v-else
              ref="dropdownWrapperRef"
              class="relative flex h-11 w-11 items-center justify-center md:h-8 md:w-8"
            >
              <button
                type="button"
                class="nav-avatar flex h-9 w-9 items-center justify-center rounded-full bg-skin-solid font-bold text-sm transition-all md:h-full md:w-full"
                :title="displayName"
                aria-haspopup="menu"
                :aria-expanded="isDropdownOpen"
                aria-label="打开用户菜单"
                @click="toggleDropdown"
              >
                {{ avatarLetter }}
              </button>
            </div>

            <!-- 移动端目录按钮：文字标签替代裸汉堡，命中区 44px -->
            <button
              type="button"
              class="md:hidden flex h-11 items-center gap-1.5 rounded-full px-3 text-[15px] font-medium text-fg backdrop-blur-sm transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              :aria-expanded="isMobileMenuOpen"
              :aria-label="isMobileMenuOpen ? '关闭目录' : '打开目录'"
              aria-controls="mobile-nav-panel"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            >
              <span
                :class="isMobileMenuOpen ? 'i-carbon-close' : 'i-carbon-menu'"
                class="text-[20px]"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- 移动端目录：贴栏的实底索引卡（150ms 下沉淡入，respects reduced motion） -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1.5"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1.5"
      >
        <div
          v-if="isMobileMenuOpen"
          id="mobile-nav-panel"
          class="mobile-panel absolute top-full left-2 right-2 z-10 mt-1.5 flex flex-col gap-1 overflow-hidden rounded-[20px] border border-line bg-canvas px-4 md:hidden"
        >
          <a
            v-for="item in menuItems"
            :key="item.name"
            :href="item.href"
            class="flex h-11 items-center gap-3 rounded-xl px-2 text-[15px] font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
            @click="isMobileMenuOpen = false"
          >
            <div :class="[item.icon, 'h-5 w-5 shrink-0 text-fg-subtle']"></div>
            {{ item.name }}
          </a>

          <div class="my-1 h-px bg-line"></div>

          <!-- 已登录：展示用户信息与个人中心入口 -->
          <template v-if="authStore.isAuthenticated">
            <div class="flex items-center gap-3 px-2 py-2">
              <div
                class="nav-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-skin-solid text-sm font-bold"
              >
                {{ avatarLetter }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-[15px] font-semibold text-fg">
                  {{ displayName }}
                </p>
                <p class="text-xs text-fg-subtle">已登录</p>
              </div>
            </div>
            <NuxtLink
              to="/profile"
              class="flex h-11 items-center gap-3 rounded-xl px-2 text-[15px] font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
              @click="isMobileMenuOpen = false"
            >
              <div class="i-carbon-user h-5 w-5 shrink-0 text-fg-subtle"></div>
              个人中心
            </NuxtLink>
            <button
              type="button"
              class="flex h-11 w-full items-center gap-3 rounded-xl px-2 text-[15px] font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              @click="
                isMobileMenuOpen = false;
                handleLogout();
              "
            >
              <div class="i-carbon-logout h-5 w-5 shrink-0"></div>
              退出登录
            </button>
          </template>

          <!-- 未登录：登录 / 注册入口（并排，主次分明） -->
          <template v-else>
            <div class="grid grid-cols-2 gap-2 p-1 py-2">
              <button
                type="button"
                class="h-11 rounded-xl bg-brand text-[15px] font-semibold text-on-brand transition active:scale-[0.98]"
                @click="
                  isMobileMenuOpen = false;
                  openAuthModal('login');
                "
              >
                Sign In
              </button>
              <button
                type="button"
                class="h-11 rounded-xl border border-line text-[15px] font-medium text-fg transition hover:bg-surface-muted active:scale-[0.98]"
                @click="
                  isMobileMenuOpen = false;
                  openAuthModal('register');
                "
              >
                Create Account
              </button>
            </div>
          </template>
        </div>
      </Transition>
    </nav>

    <!-- 点击面板外关闭：只覆盖导航栏以下区域，不拦截栏内按钮 -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden fixed inset-x-0 top-[60px] bottom-0 z-0"
      aria-hidden="true"
      @click="isMobileMenuOpen = false"
    />
  </div>

  <!-- 下拉菜单：使用 Teleport 渲染到 body，避免受导航栏层叠上下文与溢出裁剪影响 -->
  <Teleport to="body">
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
        class="rounded-xl bg-elevated shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 z-[100]"
        :style="dropdownStyle"
      >
        <div class="px-4 py-2 border-b border-line">
          <p class="text-sm font-medium text-fg truncate">
            {{ displayName }}
          </p>
        </div>
        <NuxtLink
          to="/profile/account"
          class="flex items-center gap-2 px-4 py-2 text-sm text-fg hover:bg-surface-muted"
          @click="isDropdownOpen = false"
        >
          <span class="i-carbon-user w-4 h-4" />
          个人中心
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

    <!-- 点击外部关闭的透明层 -->
    <div v-if="isDropdownOpen" class="fixed inset-0 z-[99]" @click="isDropdownOpen = false" />
  </Teleport>
</template>

<style scoped>
nav {
  /* 提升为独立合成层，滚动时不参与父层重绘 */
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 用户头像按钮：皮肤渐变底（.bg-skin-solid）+ hover 皮肤主色描边。
 * 描边与底色的 box-shadow 合并到同一条声明，避免被 .bg-skin-solid 覆盖而失效 */
.nav-avatar:hover {
  box-shadow:
    var(--skin-solid-shadow),
    0 0 0 2px var(--skin-accent);
}

/**
 * 导航壳形态过渡：全宽态（默认）⇄ 悬浮胶囊态（.is-capsule）。
 * 因外层为 fixed，max-width 过渡只重排导航壳自身，不牵动整页 reflow，
 * 故流畅且天然可中断。缓动参考 LongCat（Material 标准 cubic-bezier）。
 */
.nav-shell {
  position: relative;
  max-width: 80rem; /* 全宽态：max-w-7xl */
  transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/**
 * 胶囊外观（背景 / 圆角 / 阴影）全部承载在伪元素上，仅过渡 opacity。
 * opacity 由合成器直接处理，不触发重绘；相比过渡 background-color + box-shadow
 * （两者每帧都需重新绘制阴影模糊区域）显著降低滚动时的主线程与光栅化开销。
 * 圆角恒为 9999px —— 全宽态时该层 opacity 为 0，不可见，故无需过渡圆角。
 */
.nav-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background-color: var(--glass-bg);
  /* 外阴影 + 一道内环，还原原 ring-1 ring-black/5 的描边细节 */
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1),
    inset 0 0 0 1px rgb(0 0 0 / 0.05);
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 内容层置于装饰伪元素之上，避免被背景遮挡 */
.nav-shell > * {
  position: relative;
  z-index: 1;
}

.nav-shell.is-capsule {
  max-width: 48rem; /* 胶囊态：max-w-3xl */
}

.nav-shell.is-capsule::before {
  opacity: 1;
}

.dark .nav-shell::before {
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.3),
    0 4px 6px -4px rgb(0 0 0 / 0.3),
    inset 0 0 0 1px rgb(255 255 255 / 0.1);
}

/* 移动端目录卡：实底 + 柔和投影，避免 hero 文字透出；内部滚动不带动页面 */
.mobile-panel {
  box-shadow: var(--shadow-soft);
  overscroll-behavior: contain;
}

/* 尊重系统「减少动态效果」偏好 */
@media (prefers-reduced-motion: reduce) {
  .nav-shell {
    transition: none;
  }
  .mobile-panel,
  .mobile-panel * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

/* 暗黑模式支持 */
@media (prefers-color-scheme: dark) {
  nav {
    background-color: transparent;
  }
}

.dark nav {
  background-color: transparent;
}
</style>
