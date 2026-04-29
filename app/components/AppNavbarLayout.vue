<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '~/stores/ui';

const route = useRoute();
const uiStore = useUiStore();
const { openAuthModal } = uiStore;

// 菜单配置
const menuItems = [
  { name: 'Products', href: '/products', icon: 'i-carbon-cube' },
  { name: 'Blog', href: '/blog', icon: 'i-carbon-blog' },
  { name: '元神', href: '/character/mondstadt', icon: 'i-carbon-pricing-consumption' },
  { name: 'About Us', href: '/about', icon: 'i-carbon-group' }
];

// 组件变量状态管理
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const sentinelRef = ref<HTMLElement | null>(null);
const navShellRef = ref<HTMLElement | null>(null);
const navContentRef = ref<HTMLElement | null>(null);

// IntersectionObserver 实例
let observer: IntersectionObserver | null = null;
let flipAnimation: { cancel: any } | null = null;
let isAnimating = false;
let pendingScrolled: boolean | null = null;

// 导航栏滚动动画
const runFlip = async (nextScrolled: boolean) => {
  const shell = navShellRef.value;
  const content = navContentRef.value;
  if (!shell || !content) {
    isScrolled.value = nextScrolled;
    return;
  }

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
    isScrolled.value = nextScrolled;
    return;
  }

  // 动画进行中时不打断，排队最后一次状态，避免“突然跳终态”
  if (isAnimating) {
    pendingScrolled = nextScrolled;
    return;
  }

  isAnimating = true;
  pendingScrolled = null;

  if (flipAnimation) {
    flipAnimation.cancel();
    flipAnimation = null;
  }

  // First
  const first = shell.getBoundingClientRect();

  // Apply final layout
  isScrolled.value = nextScrolled;
  await nextTick();

  // Last
  const last = shell.getBoundingClientRect();

  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = first.width / last.width;
  const sy = first.height / last.height;

  const duration = 280;
  const easing = 'cubic-bezier(0.2, 0, 0, 1)';

  const fromTransform = `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`;

  // 先同步设置初始 transform，避免部分设备上一帧闪到终态
  shell.style.transformOrigin = 'top left';
  shell.style.transform = fromTransform;

  const invX = sx ? 1 / sx : 1;
  const invY = sy ? 1 / sy : 1;
  const fromContentTransform = `scale(${invX}, ${invY})`;
  content.style.transformOrigin = 'top left';
  content.style.transform = fromContentTransform;

  // 强制一次 reflow，确保上面的 transform 生效后再开启动画
  void shell.getBoundingClientRect();

  // Shell: FLIP transform
  const shellAnim = shell.animate(
    [
      {
        transformOrigin: 'top left',
        transform: fromTransform
      },
      {
        transformOrigin: 'top left',
        transform: 'translate3d(0, 0, 0) scale(1, 1)'
      }
    ],
    { duration, easing, fill: 'forwards' }
  );

  // Content: inverse scale to avoid visual deformation during FLIP
  const contentAnim = content.animate(
    [
      { transformOrigin: 'top left', transform: fromContentTransform },
      { transformOrigin: 'top left', transform: 'scale(1, 1)' }
    ],
    { duration, easing, fill: 'forwards' }
  );

  // 用一个“门面”保存取消能力
  flipAnimation = {
    cancel() {
      shellAnim.cancel();
      contentAnim.cancel();
    }
  };

  const finalize = () => {
    flipAnimation = null;
    isAnimating = false;
    // 清理内联 transform，避免累计误差
    shell.style.transform = '';
    content.style.transform = '';

    // 如果动画期间有新的目标状态，接着跑一次
    if (pendingScrolled !== null && pendingScrolled !== isScrolled.value) {
      const next = pendingScrolled;
      pendingScrolled = null;
      void runFlip(next);
    } else {
      pendingScrolled = null;
    }
  };

  shellAnim.onfinish = finalize;
  shellAnim.oncancel = finalize;
};

// 滚动状态切换 - 交给 FLIP 做 transform 动画
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  if (route.meta.forceCapsule) {
    if (!isScrolled.value) void runFlip(true);
    return;
  }
  const entry = entries[0];

  if (!entry) return;
  // 检查元素是否进入视口
  const nextScrolled = !entry.isIntersecting;
  if (nextScrolled === isScrolled.value) return;
  void runFlip(nextScrolled);
};

watch(
  () => route.meta.forceCapsule,
  (newVal) => {
    if (newVal) {
      void runFlip(true);
    } else {
      // 重新检查 observer 状态
      isScrolled.value = false;
    }
  }
);

onMounted(async () => {
  await nextTick();

  if (route.meta.forceCapsule) {
    isScrolled.value = true;
  }

  // 创建 IntersectionObserver - 超性能优化
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
  if (flipAnimation) {
    flipAnimation.cancel();
    flipAnimation = null;
  }
});
</script>

<template>
  <!-- 哨兵元素 -->
  <div
    ref="sentinelRef"
    class="absolute top-0 left-0 h-1 w-full pointer-events-none bg-transparent z-0"
  ></div>

  <!-- 外层容器 -->
  <div :class="[route.meta.forceCapsule ? 'fixed' : 'sticky', 'top-0 z-50 w-full']">
    <nav class="relative flex justify-center py-2">
      <!-- 导航壳：真实布局收缩（胶囊完整），动画用 FLIP 保持丝滑 -->
      <div
        ref="navShellRef"
        class="nav-shell relative flex items-center justify-between duration-300 ease-out"
        :class="[
          isScrolled
            ? `w-[92%] max-w-3xl bg-white/90 dark:bg-neutral-900/80 rounded-full shadow-lg ring-1 ring-black/5 dark:ring-white/10 px-6 py-3 md:px-8 md:py-4`
            : 'w-full max-w-7xl bg-transparent px-6 py-3 md:px-8 md:py-4'
        ]"
        style="will-change: transform"
      >
        <!-- 内容层：反向缩放抵消 FLIP，避免文字/图标变形 -->
        <div
          ref="navContentRef"
          class="flex items-center justify-between w-full"
          style="will-change: transform"
        >
          <!-- 左侧 Logo -->
          <div class="shrink-0">
            <a href="/" class="flex items-center gap-2">
              <div
                class="h-8 w-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"
                  />
                </svg>
              </div>
              <p class="font-bold font-display text-xl text-gray-900 dark:text-white">CoreDB</p>
            </a>
          </div>

          <!-- 中间菜单 (桌面端显示) -->
          <div class="items-center justify-center gap-1 hidden md:flex">
            <a
              v-for="item in menuItems"
              :key="item.name"
              :href="item.href"
              class="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              {{ item.name }}
            </a>
          </div>

          <!-- 右侧 Sign In 按钮 -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              class="h-8 items-center justify-center relative mr-2 group hidden md:flex pl-4"
              @click="openAuthModal('login')"
            >
              <div
                class="flex gap-2 items-center relative z-20 text-sm font-medium text-black-900 dark:text-white"
              >
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
                class="h-8 pointer-events-none z-10 w-8 group-hover:w-[120%] transition-all duration-300 absolute top-0 -right-2 bg-neutral-200 dark:bg-white/10 rounded-full flex items-center justify-center"
              ></span>
            </button>

            <!-- 移动端菜单按钮 -->
            <UButton
              class="md:hidden rounded-full"
              variant="ghost"
              color="neutral"
              :icon="isMobileMenuOpen ? 'i-carbon-close' : 'i-carbon-menu'"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            />
          </div>
        </div>
      </div>

      <!-- 移动端菜单面板 -->
      <div
        v-show="isMobileMenuOpen"
        class="absolute top-full left-0 right-0 mx-auto flex flex-col gap-2 overflow-hidden transition-all duration-300 origin-top md:hidden"
        :class="[
          isScrolled
            ? 'w-[92%] max-w-3xl bg-white/95 dark:bg-neutral-900/95 rounded-3xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 p-4 mt-2'
            : 'w-[96%] max-w-7xl bg-white/95 dark:bg-neutral-900/95 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 p-4 mt-2'
        ]"
      >
        <a
          v-for="item in menuItems"
          :key="item.name"
          :href="item.href"
          class="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          @click="isMobileMenuOpen = false"
        >
          <div
            :class="[
              item.icon,
              'w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'
            ]"
          ></div>
          {{ item.name }}
        </a>

        <div class="h-px bg-gray-100 dark:bg-white/5 my-1"></div>

        <button
          type="button"
          class="flex items-center w-full gap-3 px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          @click="
            isMobileMenuOpen = false;
            openAuthModal('login');
          "
        >
          <div
            class="i-carbon-login w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
          ></div>
          Sign In
        </button>
        <button
          type="button"
          class="flex items-center w-full gap-3 px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          @click="
            isMobileMenuOpen = false;
            openAuthModal('register');
          "
        >
          <div
            class="i-carbon-user-follow w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
          ></div>
          Create Account
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* 超轻量级 60 FPS 优化 */
nav {
  /* GPU 硬件加速 */
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 将绘制影响尽量限制在导航内部，降低滚动时重绘范围 */
.nav-shell {
  contain: paint;
}

.nav-bg {
  transform-origin: center;
}

/* 确保合成层优化 */
[style*='will-change'] {
  will-change: transform;
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
