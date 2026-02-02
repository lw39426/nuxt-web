<template>
  <div
    class="font-sans text-gray-900 dark:text-white bg-white dark:bg-black selection:bg-mint-500/20 selection:text-900 flex flex-col min-h-screen"
  >
    <!-- 导航栏 -->
    <AppNavbarLayout />

    <div class="flex-1">
      <slot />
    </div>

    <!-- Footer -->
    <AppFooter />

    <!-- Floating Menu -->
    <AppFloatingMenu />
  </div>
</template>
<script setup lang="ts"></script>
<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
