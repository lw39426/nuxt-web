<script setup lang="ts">
// Theme Logic — 使用 @nuxtjs/color-mode（由 @nuxt/ui 自动安装）
const colorMode = useColorMode();
const mode = computed(() => colorMode.preference as 'system' | 'light' | 'dark');
const setMode = (value: 'system' | 'light' | 'dark') => {
  colorMode.preference = value;
};
const modeIndex = computed(() => (mode.value === 'system' ? 0 : mode.value === 'light' ? 1 : 2));

// Scroll Logic
const showBackToTop = ref(false);
const onScroll = () => {
  showBackToTop.value = (window.scrollY || document.documentElement.scrollTop) > 240;
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
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('click', handleClickOutside);
  onScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
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
    mode.value === value
      ? 'text-gray-900 dark:text-white'
      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
  ].join(' ');
</script>

<template>
  <div ref="menuRef" class="fixed top-2/3 right-0 z-50">
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
        class="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-l-2xl shadow-[-4px_0_24px_rgba(0,0,0,0.1)] p-4 w-48 mr-2"
      >
        <div class="flex flex-col gap-4">
          <!-- Theme Switcher -->
          <div class="space-y-2">
            <div
              class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 flex justify-between items-center"
            >
              <span>外观</span>
              <button
                class="hover:text-gray-800 dark:hover:text-white transition-colors"
                @click="isOpen = false"
              >
                <span class="i-carbon-close text-sm"></span>
              </button>
            </div>
            <div
              class="flex items-center rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 p-1 relative"
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
            class="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl transition-colors text-sm font-medium"
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
      class="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-r-0 border-gray-200 dark:border-white/10 rounded-l-full shadow-[-2px_0_8px_rgba(0,0,0,0.05)] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:w-10 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300 cursor-pointer group"
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
