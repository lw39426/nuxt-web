<template>
  <div class="font-sans text-gray-900 bg-white selection:bg-mint-500/20 selection:text-mint-900">
    <!-- 60 FPS 超优化导航栏 -->
    <AppNavbarLayout />

    <slot />

    <!-- Footer Simplified -->
    <footer class="bg-gray-50 border-t border-gray-200 py-16 mt-20">
      <div class="section-container grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div class="col-span-2">
          <div class="font-bold text-xl mb-4 flex items-center gap-2">
            <div class="i-carbon-ibm-watson-discovery text-mint-600" />
            Mintlify
          </div>
        </div>
        <!-- Placeholder links -->
        <div v-for="i in 3" :key="i" class="flex flex-col gap-3 text-gray-500">
          <span class="font-bold text-gray-900 uppercase tracking-wider text-xs mb-1"
            >Column {{ i }}</span
          >
          <a href="#">Link Item</a>
          <a href="#">Link Item</a>
          <a href="#">Link Item</a>
        </div>
      </div>
      <div
        class="section-container mt-12 pt-8 border-t border-gray-200 flex justify-between text-xs text-gray-500"
      >
        <span>© 2025 Mintlify, Inc.</span>
        <div class="flex gap-4">
          <div class="i-carbon-logo-twitter" />
          <div class="i-carbon-logo-github" />
        </div>
      </div>
    </footer>
    <!-- Back to Top Button -->
    <button
      v-show="showBackToTop"
      type="button"
      aria-label="Back to top"
      class="fixed bottom-6 right-6 z-50 rounded-full bg-pink text-white p-3 shadow-lg hover:bg-gray-900 transition"
      @click="backToTop"
    >
      <div class="i-carbon-arrow-up text-lg" />
    </button>
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
