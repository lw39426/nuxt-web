<template>
  <div
    class="font-sans text-gray-900 bg-white dark:bg-black selection:bg-mint-500/20 selection:text-mint-900 flex flex-col min-h-screen"
  >
    <!-- 导航栏 -->
    <AppNavbarLayout />

    <div class="flex-1">
      <slot />
    </div>

    <!-- Footer -->
    <AppFooter />

    <!-- Back to Top Button -->
    <UButton
      v-show="showBackToTop"
      size="xl"
      square
      class="fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300 dark:bg-white dark:text-black"
      @click="backToTop"
    >
      <div class="i-carbon-arrow-up text-white/90 text-xl" />
    </UButton>
  </div>
</template>
<script setup lang="ts">
/**
 * 处理滚动事件，决定是否显示“回到顶部”按钮
 */
const showBackToTop = ref(false)
const onScroll = () => {
  showBackToTop.value = (window.scrollY || document.documentElement.scrollTop) > 240
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

/**
 * 平滑滚动到页面顶部
 */
const backToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
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
