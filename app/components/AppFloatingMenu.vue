<script setup lang="ts">
import type { ThemeMode } from '~/composables/useThemeMode'

// Theme Logic
const { mode, setMode } = useThemeMode()
const modeIndex = computed(() => (mode.value === 'system' ? 0 : mode.value === 'light' ? 1 : 2))

// Scroll Logic
const showBackToTop = ref(false)
const onScroll = () => {
  showBackToTop.value = (window.scrollY || document.documentElement.scrollTop) > 240
}

// Menu State
const isOpen = ref(false)
const toggleMenu = (event: MouseEvent) => {
  event.stopPropagation()
  isOpen.value = !isOpen.value
}

// Close menu when clicking outside
const menuRef = ref<HTMLElement | null>(null)

// Basic click outside logic
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('click', handleClickOutside)
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const backToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getIcon = (m: string) => {
  switch (m) {
    case 'system':
      return 'i-carbon-screen'
    case 'light':
      return 'i-carbon-sun'
    case 'dark':
      return 'i-carbon-moon'
    default:
      return ''
  }
}

const buttonClass = (value: ThemeMode) =>
  [
    'flex-1 flex items-center justify-center py-1.5 rounded-full transition-colors relative z-10',
    'focus:outline-none',
    mode.value === value
      ? 'text-gray-900 dark:text-white'
      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
  ].join(' ')
</script>

<template>
  <div ref="menuRef" class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
    <!-- Panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-show="isOpen"
        class="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-4 w-48 mb-2"
      >
        <div class="flex flex-col gap-4">
          <!-- Theme Switcher -->
          <div class="space-y-2">
            <div
              class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1"
            >
              外观
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
                :class="buttonClass(m as ThemeMode)"
                :aria-label="m"
                @click="setMode(m as ThemeMode)"
              >
                <div :class="[getIcon(m), 'w-4 h-4']" />
              </button>
            </div>
          </div>

          <!-- Back to Top -->
          <button
            v-if="showBackToTop"
            class="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl transition-colors text-sm font-medium"
            @click="backToTop"
          >
            <div class="i-carbon-arrow-up" />
            <span>回到顶部</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Trigger Button -->
    <UButton
      size="xl"
      square
      class="rounded-full shadow-lg transition-all duration-300"
      :class="
        isOpen
          ? 'bg-gray-900 dark:bg-white text-white dark:text-black rotate-90'
          : 'bg-white dark:bg-black text-black dark:text-white'
      "
      @click="toggleMenu"
    >
      <div v-if="isOpen" class="i-carbon-close text-xl" />
      <div v-else class="i-carbon-settings text-xl" />
    </UButton>
  </div>
</template>

<style scoped>
.theme-indicator {
  transform: translate3d(calc(var(--theme-index) * 100%), 0, 0);
}
</style>
