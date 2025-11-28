<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
    <!-- 版本选择器 -->
    <div class="fixed top-4 right-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">导航栏版本</h3>
        <div class="space-y-2">
          <button
            :class="currentVersion === 'original' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'"
            class="w-full px-3 py-1.5 text-xs rounded transition-colors"
            @click="switchVersion('original')"
          >
            原版 CSS
          </button>
          <button
            :class="currentVersion === 'optimized' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'"
            class="w-full px-3 py-1.5 text-xs rounded transition-colors"
            @click="switchVersion('optimized')"
          >
            60 FPS 优化版
          </button>
        </div>
      </div>
    </div>

    <!-- 当前导航栏 -->
    <component :is="currentNavbarComponent" />

    <!-- 测试内容 -->
    <div class="container mx-auto px-4 py-16">
      <section class="text-center py-32">
        <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-6">60 FPS 导航栏测试</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">快速滚动测试导航栏性能，体验丝滑切换效果</p>
        <div class="h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center">
          <p class="text-white text-2xl font-semibold">Banner 测试区域</p>
        </div>
      </section>

      <!-- 性能对比说明 -->
      <section class="max-w-4xl mx-auto mb-16">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">性能对比说明</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4">⚠️ 原版问题</h3>
              <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• 使用 width/height 属性变化</li>
                <li>• 触发重排重绘</li>
                <li>• 动画不够流畅</li>
                <li>• 可能有轻微卡顿</li>
              </ul>
            </div>
            
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">✅ 优化版优势</h3>
              <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• 仅使用 transform 属性</li>
                <li>• GPU 硬件加速</li>
                <li>• 60 FPS 流畅动画</li>
                <li>• IntersectionObserver 优化</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 大量滚动测试内容 -->
      <section class="space-y-16">
        <div
          v-for="i in 20"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
        >
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">测试章节 {{ i }}</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            这是第 {{ i }} 个测试内容块，用于验证导航栏在滚动时的性能表现。
            当前使用：<strong class="text-blue-500">{{ currentVersion === 'original' ? '原版 CSS 动画' : '60 FPS 优化版' }}</strong>
          </p>
          <div class="h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
            <span class="text-lg font-medium text-gray-700 dark:text-gray-300">
              滚动测试区域 - 快速滚动测试性能
            </span>
          </div>
        </div>
      </section>

      <!-- 底部测试区域 -->
      <section class="py-32 text-center">
        <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">性能测试完成</h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">导航栏在整个滚动过程中应该保持 60 FPS 流畅度</p>
        <div class="mt-8">
          <button
            class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="scrollToTop"
          >
            回到顶部再测试一次
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 当前版本选择
const currentVersion = ref('optimized')

// 组件映射
const navbarComponents = {
  'original': 'AppNavbar',
  'optimized': 'AppNavbarOptimized60fps'
}

const currentNavbarComponent = computed(() => {
  return navbarComponents[currentVersion.value] || 'AppNavbar'
})

// 版本切换
const switchVersion = (version) => {
  currentVersion.value = version
  // 滚动到顶部重新开始测试
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>