<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
    <!-- 使用优化后的导航栏 -->
    <AppNavbarOptimized />
    
    <!-- 测试内容区域 -->
    <div class="container mx-auto px-4 py-16">
      <!-- 大标题区域 -->
      <section class="text-center py-32">
        <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-6">
          60 FPS 导航栏测试
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
          滚动页面测试导航栏性能，体验丝滑切换效果
        </p>
        <div class="h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center">
          <p class="text-white text-2xl font-semibold">Banner 区域</p>
        </div>
      </section>

      <!-- 大量内容用于滚动测试 -->
      <section class="space-y-16">
        <div v-for="i in 10" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            测试章节 {{ i }}
          </h2>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            这是一段测试文本，用于验证导航栏在滚动时的性能表现。
            优化后的导航栏使用 CSS 变量驱动，只改变合成层属性，
            确保 60 FPS 流畅体验。
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-6 rounded-xl">
              <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">GPU 加速</h3>
              <p class="text-sm text-blue-700 dark:text-blue-300">使用 transform 和 opacity 属性</p>
            </div>
            <div class="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 p-6 rounded-xl">
              <h3 class="font-semibold text-green-900 dark:text-green-100 mb-2">CSS 变量</h3>
              <p class="text-sm text-green-700 dark:text-green-300">单条 transition 驱动所有变化</p>
            </div>
            <div class="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 p-6 rounded-xl">
              <h3 class="font-semibold text-purple-900 dark:text-purple-100 mb-2">IntersectionObserver</h3>
              <p class="text-sm text-purple-700 dark:text-purple-300">原生节流，性能最优</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部大区域 -->
      <section class="py-32 text-center">
        <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          性能测试完成
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          导航栏在整个滚动过程中应该保持 60 FPS 流畅度
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
// 这个页面专门用于测试优化后的导航栏性能
</script>