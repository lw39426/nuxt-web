<script setup lang="ts">
// Theme Logic — 使用 @nuxtjs/color-mode（由 @nuxt/ui 自动安装）
const colorMode = useColorMode();
const mode = computed(() => colorMode.preference as 'system' | 'light' | 'dark');
const setMode = (value: 'system' | 'light' | 'dark') => {
  colorMode.preference = value;
};
const modeIndex = computed(() => (mode.value === 'system' ? 0 : mode.value === 'light' ? 1 : 2));

// Scroll Logic — 使用 IntersectionObserver 哨兵判断是否滚过页面顶部 240px。
// 文档顶部放一个高 240px 的哨兵，其完全滚出视口即认为「已滚过」。
// 相比 window scroll 监听，IO 回调仅在状态跨越阈值时触发，滚动过程中不占主线程。
const showBackToTop = ref(false);
const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

/**
 * IntersectionObserver 回调函数
 * 当哨兵元素与视口的相交状态发生变化时触发
 * @param entries - 相交观测条目数组
 */
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  // 取第一个观测条目（本组件只 observe 一个哨兵元素），安全访问避免数组为空的情况
  const entry = entries[0];
  if (entry) {
    // 哨兵与视口无交集 = 已滚过顶部，显示「回到顶部」按钮
    showBackToTop.value = !entry.isIntersecting;
  }
};

// Menu State
const isOpen = ref(false);
const toggleMenu = (event: MouseEvent) => {
  event.stopPropagation();
  isOpen.value = !isOpen.value;
};

// Close menu when clicking outside
const menuRef = ref<HTMLElement | null>(null);

// Basic click outside logic
onMounted(() => {
  // 替换 window scroll 监听为 IO 哨兵：observe 后立即触发一次回调，天然完成初始落位
  observer = new IntersectionObserver(handleIntersection, {
    root: null,
    threshold: 0
  });

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  window.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

const backToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const getIcon = (m: string) => {
  switch (m) {
    case 'system':
      return 'i-carbon-screen';
    case 'light':
      return 'i-carbon-sun';
    case 'dark':
      return 'i-carbon-moon';
    default:
      return '';
  }
};

const buttonClass = (value: 'system' | 'light' | 'dark') =>
  [
    'flex-1 flex items-center justify-center py-1.5 rounded-full transition-colors relative z-10',
    'focus:outline-none',
    mode.value === value ? 'text-fg' : 'text-fg-muted hover:text-fg'
  ].join(' ');
</script>

<template>
  <!-- 滚动哨兵：贴在文档顶部、高 240px。其完全滚出视口即等价于原先的 scrollY > 240。
       不可见、不占位、不拦截事件，仅供 IntersectionObserver 观测。 -->
  <div
    ref="sentinelRef"
    class="absolute top-0 left-0 h-[240px] w-full pointer-events-none bg-transparent"
    aria-hidden="true"
  ></div>

  <div ref="menuRef" class="fixed top-[90%] right-0 z-50">
    <!-- Panel (展开时的面板) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-8"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-300 ease-in-out"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-8"
    >
      <div
        v-show="isOpen"
        class="absolute right-0 top-1/2 -translate-y-1/2 bg-glass backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-l-2xl shadow-[-4px_0_24px_rgba(0,0,0,0.1)] p-4 w-48 mr-2"
      >
        <div class="flex flex-col gap-4">
          <!-- Theme Switcher -->
          <div class="space-y-2">
            <div
              class="text-xs font-medium text-fg-muted uppercase tracking-wider px-1 flex justify-between items-center"
            >
              <span>外观</span>
              <button class="hover:text-fg" @click="isOpen = false">
                <span class="i-carbon-close text-sm"></span>
              </button>
            </div>
            <div
              role="group"
              aria-label="切换主题"
              class="flex items-center rounded-full bg-surface-muted border border-line p-1 relative"
              :style="{ '--theme-index': String(modeIndex) }"
            >
              <!-- Indicator -->
              <div
                class="theme-indicator absolute top-1 left-1 w-[calc((100%-0.5rem)/3)] h-[calc(100%-0.5rem)] rounded-full bg-white dark:bg-white/20 shadow-sm transition-transform duration-200 ease-out will-change-transform"
              />

              <!-- Buttons -->
              <button
                v-for="m in ['system', 'light', 'dark']"
                :key="m"
                type="button"
                :class="buttonClass(m as 'system' | 'light' | 'dark')"
                :aria-label="m"
                @click="setMode(m as 'system' | 'light' | 'dark')"
              >
                <div :class="[getIcon(m), 'w-4 h-4']" />
              </button>
            </div>
          </div>

          <!-- Back to Top -->
          <button
            v-show="showBackToTop"
            class="flex items-center justify-center gap-2 w-full py-2.5 bg-surface-muted hover:bg-elevated text-fg rounded-xl transition-colors text-sm font-medium"
            @click="backToTop"
          >
            <div class="i-carbon-arrow-up" />
            <span>回到顶部</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Trigger Button (吸附在右侧边缘的半圆) -->
    <button
      class="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-glass backdrop-blur-sm border border-r-0 border-line rounded-l-full shadow-[-2px_0_8px_rgba(0,0,0,0.05)] flex items-center justify-center text-fg-muted hover:w-10 hover:bg-elevated transition-all duration-300 cursor-pointer group"
      :class="isOpen ? 'translate-x-0 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'"
      @click="toggleMenu"
    >
      <div class="i-carbon-settings text-lg group-hover:animate-spin-slow" />
    </button>
  </div>
</template>

<style scoped>
.theme-indicator {
  transform: translate3d(calc(var(--theme-index) * 100%), 0, 0);
}
</style>
