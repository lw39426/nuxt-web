<script setup lang="ts">
import type { ThemeMode } from '~/composables/useThemeMode'

const { mode, setMode } = useThemeMode()

const modeIndex = computed(() => (mode.value === 'system' ? 0 : mode.value === 'light' ? 1 : 2))

const buttonClass = (value: ThemeMode) =>
  [
    'w-8 h-7 rounded-full flex items-center justify-center transition-colors relative z-10',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
    mode.value === value ? 'text-white' : 'text-gray-300 hover:text-white'
  ].join(' ')
</script>
<template>
  <footer class="bg-black text-white py-12 md:py-16 border-t border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-12">
        <!-- Brand Column -->
        <div class="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-black">
              <div class="i-carbon-cube w-5 h-5 text-white/90" />
            </div>
            <span class="font-bold text-xl">CoreDB</span>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed max-w-xs">
            The modern way to manage your databases. Deploy, scale, and manage your databases with
            ease.
          </p>
          <div class="flex gap-4">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <div class="i-carbon-logo-x w-5 h-5 text-white/90" />
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <div class="i-carbon-logo-github w-5 h-5 text-white/90" />
            </a>
          </div>
        </div>

        <!-- Links Columns -->
        <div class="grid grid-cols-2 gap-10 sm:gap-12 md:grid-cols-2 lg:contents">
          <div>
            <h3 class="font-bold text-sm mb-4">Solutions</h3>
            <ul class="flex flex-col gap-3 text-sm text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Marketing</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Automation</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Commerce</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Insights</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-sm mb-4">Support</h3>
            <ul class="flex flex-col gap-3 text-sm text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Submit ticket</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Guides</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-sm mb-4">Company</h3>
            <ul class="flex flex-col gap-3 text-sm text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">About</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Jobs</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-sm mb-4">Legal</h3>
            <ul class="flex flex-col gap-3 text-sm text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Terms of service</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Privacy policy</a></li>
              <li><a href="#" class="hover:text-white transition-colors">License</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p class="text-gray-300 text-sm">© 2025 CoreDB. All rights reserved.</p>
        <div
          class="inline-flex items-center rounded-full bg-white/10 border border-white/10 p-1 relative overflow-hidden"
          role="group"
          aria-label="主题切换"
          :style="{ '--theme-index': String(modeIndex) }"
        >
          <div
            class="theme-indicator absolute top-1 left-1 w-8 h-7 rounded-full bg-white/20 border border-white/10 transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none pointer-events-none"
          />
          <button
            type="button"
            :class="buttonClass('system')"
            aria-label="跟随系统"
            @click="setMode('system')"
          >
            <div class="i-carbon-screen w-5 h-5" />
          </button>
          <button
            type="button"
            :class="buttonClass('light')"
            aria-label="浅色模式"
            @click="setMode('light')"
          >
            <div class="i-carbon-sun w-5 h-5" />
          </button>
          <button
            type="button"
            :class="buttonClass('dark')"
            aria-label="深色模式"
            @click="setMode('dark')"
          >
            <div class="i-carbon-moon w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.theme-indicator {
  transform: translate3d(calc(var(--theme-index) * 2rem), 0, 0);
}
</style>
