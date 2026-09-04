<template>
  <div class="font-sans text-fg bg-canvas selection:bg-brand-soft flex flex-col min-h-screen">
    <!-- 导航栏 -->
    <AppNavbarLayout v-if="!$route.meta.hideNavbar" />

    <div class="flex-1">
      <slot />
    </div>

    <!-- Footer -->
    <AppFooter v-if="!$route.meta.hideFooter" />

    <!-- Floating Menu -->
    <ClientOnly>
      <AppFloatingMenu v-if="!$route.meta.hideFloatingMenu" />
    </ClientOnly>

    <!-- 小星AI入口 -->
    <NuxtLink
      v-if="!$route.path.includes('/ai-page')"
      to="/ai-page"
      target="_blank"
      class="fixed right-6 bottom-62 z-50 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 flex items-center justify-center group"
      title="小星AI专属陪伴"
    >
      <span class="i-lucide-sparkles text-2xl animate-pulse"></span>
      <span
        class="absolute right-full mr-3 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm"
      >
        小星AI专属陪伴
      </span>
    </NuxtLink>

    <!-- FPS 实时显示（仅开发环境） -->
    <AppFpsMeter v-if="isDev" />
  </div>
</template>
<script setup lang="ts">
// 仅在开发环境挂载 FPS 面板，生产构建会被 tree-shake 掉
const isDev = import.meta.dev;
</script>
<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
