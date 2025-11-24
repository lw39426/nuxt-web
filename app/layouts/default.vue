<template>
  <div class="font-sans text-gray-900 bg-white selection:bg-mint-500/20 selection:text-mint-900">
    <!-- Navigation -->
    <header class="absolute top-0 w-full z-50 py-4 px-6 mx-auto">
      <div
        class="flex items-center justify-between max-w-[66rem] w-full mx-auto gap-x-8"
        :class="isHome ? 'text-white' : 'text-gray-900'"
      >
        <div class="flex items-center gap-2 text-xl font-bold font-display">
          <div class="i-carbon-ibm-watson-discovery text-mint-400 text-2xl" />
          <NuxtLink to="/" class="font-bold">Mintlify</NuxtLink>
        </div>

        <div
          class="font-semibold text-[15px] font-medium flex items-center gap-3 md:gap-8 overflow-x-auto whitespace-nowrap no-scrollbar px-2 md:px-0"
          :class="isHome ? 'text-white/90' : 'text-gray-900/90'"
        >
          <template v-for="link in navLinks" :key="link.label">
            <NuxtLink v-if="link.to" :to="link.to" :class="navLinkClass">
              {{ link.label }}
            </NuxtLink>
            <a v-else :href="link.href" :class="navLinkClass">
              {{ link.label }}
            </a>
          </template>
        </div>

        <div class="flex items-center gap-4">
          <a
            href="#"
            :class="[
              isHome ? 'text-white' : 'text-black',
              'text-sm font-medium hover:bg-white/20 backdrop-blur-md rounded-full px-5 py-2 hidden sm:block'
            ]"
            >Contact sales</a
          >
          <button
            class="bg-white text-mint-900 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
          >
            Start for free
          </button>
        </div>
      </div>
    </header>

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
const route = useRoute()
const isHome = computed(() => route.path === '/')
/**
 * 生成导航链接的类名
 */
const navLinkClass = computed(() => [
  isHome.value ? 'hover:text-white' : 'hover:text-black',
  'cursor-pointer hover:bg-white/20 hover:backdrop-blur-md hover:rounded-full '
])
/**
 * 导航链接数据
 */
const navLinks = [
  { label: 'Categories', to: '/' },
  { label: 'Products', to: '/' },
  { label: 'Article', to: '/articles' },
  { label: 'Customers', href: '#' },
  { label: 'Pricing', href: '#' }
]

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
