<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// 菜单配置
const menuItems = [
  { name: 'Products', href: '/products' },
  { name: 'Blog', href: '/blog' },
  { name: 'Pricing', href: '#' },
  { name: 'About Us', href: '/about' }
]

// 状态管理
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const sentinelRef = ref(null)

// IntersectionObserver 实例
let observer = null

// 滚动状态切换 - 超轻量级
const handleIntersection = (entries) => {
  isScrolled.value = !entries[0].isIntersecting
}

onMounted(async () => {
  await nextTick()

  // 创建 IntersectionObserver - 超性能优化
  observer = new IntersectionObserver(handleIntersection, {
    root: null,
    threshold: 0,
    rootMargin: '10px 0px 0px 0px'
  })

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })
})
</script>

<template>
  <!-- 哨兵元素 -->
  <div
    ref="sentinelRef"
    class="absolute top-0 left-0 h-1 w-full pointer-events-none bg-transparent z-0"
  ></div>

  <!-- 外层容器 -->
  <div class="sticky top-0 z-50 w-full">
    <nav
      class="relative flex justify-center py-2"
      :class="[isScrolled ? '' : 'backdrop-blur-[8px]']"
    >
      <!-- 核心变形容器：超轻量级 CSS 动画 -->
      <div
        class="flex items-center justify-between transition-all duration-300 ease-out"
        :class="[
          isScrolled
            ? 'w-[92%] max-w-3xl bg-white/90 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 px-6 py-3 mt-2'
            : 'w-full max-w-7xl bg-transparent px-4 sm:px-6 lg:px-8 py-2'
        ]"
        style="will-change: transform; transform: translateZ(0)"
      >
        <!-- 左侧 Logo -->
        <a href="/" class="flex items-center gap-2 shrink-0">
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
          <a
            href="/login"
            class="h-8 items-center justify-center relative mr-2 group hidden md:flex pl-4"
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
          </a>

          <!-- 移动端菜单按钮 -->
          <UButton
            class="md:hidden rounded-full"
            variant="ghost"
            color="gray"
            :icon="isMobileMenuOpen ? 'i-carbon-close' : 'i-carbon-menu'"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          />
        </div>
      </div>

      <!-- 移动端菜单面板 -->
      <div
        v-show="isMobileMenuOpen"
        class="absolute top-full left-1/2 -translate-x-1/2 flex flex-col gap-2 overflow-hidden transition-all duration-300 origin-top md:hidden"
        :class="[
          isScrolled
            ? 'w-[92%] max-w-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-3xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-4 mt-2'
            : 'w-full bg-white dark:bg-neutral-900 shadow-lg p-4 border-t border-gray-100 dark:border-gray-800'
        ]"
      >
        <a
          v-for="item in menuItems"
          :key="item.name"
          :href="item.href"
          class="px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          @click="isMobileMenuOpen = false"
        >
          {{ item.name }}
        </a>

        <div class="h-px bg-gray-100 dark:bg-white/5 my-1"></div>

        <a
          href="/login"
          class="px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          @click="isMobileMenuOpen = false"
        >
          Sign In
        </a>
        <a
          href="/register"
          class="px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          @click="isMobileMenuOpen = false"
        >
          Create Account
        </a>
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
