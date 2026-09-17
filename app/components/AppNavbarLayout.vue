<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
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
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <!-- 占位元素：外层导航改为 fixed 后脱离文档流，此处在正常流中占据等高空间，
       将页面内容顶到导航下方（等效原 sticky 的占位行为）。强制胶囊态的沉浸式页面不占位。 -->
  <div v-if="!route.meta.forceCapsule" class="h-[72px] md:h-[80px]" aria-hidden="true"></div>

  <!-- 哨兵元素：位于文档流顶部，滚出视口即视为「已滚动」，由 IntersectionObserver 监听 -->
  <div
    ref="sentinelRef"
    class="absolute top-0 left-0 h-1 w-full pointer-events-none bg-transparent z-0"
  ></div>

  <!-- 外层容器：始终 fixed 悬浮。脱离文档流后，导航壳的宽度/内边距过渡只重排自身，
       不触发整页 reflow —— 这是流畅切换的关键（参考 LongCat 的实现思路）。 -->
  <div class="fixed top-0 left-0 right-0 z-50 w-full">
    <nav class="relative flex justify-center px-4 py-2">
      <!-- 导航壳：胶囊态 ⇄ 全宽态，纯 CSS transition 平滑过渡，天然可中断。
           形态样式统一由 scoped CSS 的 .nav-shell / .is-capsule 声明，
           避免 UnoCSS 同优先级工具类（如 max-w-3xl / max-w-7xl）互相覆盖导致状态错乱。 -->
      <div
        class="nav-shell w-full flex items-center justify-between px-6 py-3 md:px-8 md:py-4"
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

            <!-- 已登录：头像下拉菜单 -->
            <div v-else ref="dropdownWrapperRef" class="relative hidden md:block">
              <button
                type="button"
                class="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-on-brand font-bold text-sm hover:ring-2 hover:ring-brand-hover transition-all"
                @click="toggleDropdown"
              >
                {{ avatarLetter }}
              </button>
            </div>

            <!-- 移动端菜单按钮（保持不变） -->
            <UButton
              class="md:hidden rounded-full"
              variant="ghost"
              color="neutral"
              :icon="isMobileMenuOpen ? 'i-carbon-close' : 'i-carbon-menu'"
              @click="
                () => {
                  isMobileMenuOpen = !isMobileMenuOpen;
                }
              "
            />
          </div>
        </div>
      </div>

      <!-- 移动端菜单面板 -->
      <div
        v-show="isMobileMenuOpen"
        class="mobile-panel absolute top-full left-4 right-4 mx-auto w-auto flex flex-col gap-2 overflow-hidden bg-glass rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 p-4 mt-2 origin-top md:hidden"
        :class="{ 'is-capsule': isScrolled }"
      >
        <a
          v-for="item in menuItems"
          :key="item.name"
          :href="item.href"
          class="flex items-center gap-3 px-4 py-3 text-base font-medium text-fg-muted hover:text-fg hover:bg-surface-muted rounded-xl transition-colors"
          @click="isMobileMenuOpen = false"
        >
          <div :class="[item.icon, 'w-5 h-5 text-fg-subtle group-hover:text-fg-muted']"></div>
          {{ item.name }}
        </a>

        <div class="h-px bg-line my-1"></div>

        <button
          type="button"
          class="flex items-center w-full gap-3 px-4 py-3 text-base font-medium text-fg-muted hover:text-fg hover:bg-surface-muted rounded-xl transition-colors"
          @click="
            isMobileMenuOpen = false;
            openAuthModal('login');
          "
        >
          <div class="i-carbon-login w-5 h-5 text-fg-subtle group-hover:text-fg-muted"></div>
          Sign In
        </button>
        <button
          type="button"
          class="flex items-center w-full gap-3 px-4 py-3 text-base font-medium text-fg-muted hover:text-fg hover:bg-surface-muted rounded-xl transition-colors"
          @click="
            isMobileMenuOpen = false;
            openAuthModal('register');
          "
        >
          <div class="i-carbon-user-follow w-5 h-5 text-fg-subtle group-hover:text-fg-muted"></div>
          Create Account
        </button>
      </div>
    </nav>
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

/* 移动端菜单面板：宽度跟随导航壳形态同步收缩 */
.mobile-panel {
  max-width: 80rem;
  transition: max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-panel.is-capsule {
  max-width: 48rem;
}

/* 尊重系统「减少动态效果」偏好 */
@media (prefers-reduced-motion: reduce) {
  .nav-shell,
  .mobile-panel {
    transition: none;
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
