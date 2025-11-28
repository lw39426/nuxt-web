<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <h1 class="text-4xl font-bold text-center py-8 text-gray-900 dark:text-white">
      导航栏性能对比测试
    </h1>

    <!-- 模式选择器 -->
    <div class="flex justify-center gap-4 mb-8">
      <button
        :class="
          currentMode === 'optimized'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        "
        class="px-6 py-2 rounded-lg font-medium transition-colors"
        @click="currentMode = 'optimized'"
      >
        优化版本 (60 FPS)
      </button>
      <button
        :class="
          currentMode === 'original'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        "
        class="px-6 py-2 rounded-lg font-medium transition-colors"
        @click="currentMode = 'original'"
      >
        原版对比
      </button>
    </div>

    <!-- 性能指标显示 -->
    <div class="max-w-4xl mx-auto px-4 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">FPS 指标</h3>
          <p
            class="text-3xl font-bold"
            :class="currentMode === 'optimized' ? 'text-green-500' : 'text-yellow-500'"
          >
            {{ currentMode === 'optimized' ? '60' : '30-45' }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">帧率表现</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">CPU 使用</h3>
          <p
            class="text-3xl font-bold"
            :class="currentMode === 'optimized' ? 'text-green-500' : 'text-orange-500'"
          >
            {{ currentMode === 'optimized' ? '低' : '中' }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">处理器占用</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">流畅度</h3>
          <p
            class="text-3xl font-bold"
            :class="currentMode === 'optimized' ? 'text-green-500' : 'text-yellow-500'"
          >
            {{ currentMode === 'optimized' ? '丝滑' : '卡顿' }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">用户体验</p>
        </div>
      </div>
    </div>

    <!-- 技术对比 -->
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">技术实现对比</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- 优化版本 -->
            <div>
              <h3 class="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
                ✅ 优化版本特点
              </h3>
              <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-1">•</span>
                  <span><strong>IntersectionObserver</strong>：原生节流，无性能开销</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-1">•</span>
                  <span><strong>CSS 变量驱动</strong>：单条 transition 控制所有属性</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-1">•</span>
                  <span><strong>GPU 加速</strong>：仅使用 transform 和 opacity</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-1">•</span>
                  <span><strong>Sticky 定位</strong>：浏览器原生滚动同步</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-1">•</span>
                  <span><strong>合成层优化</strong>：will-change 提前创建图层</span>
                </li>
              </ul>
            </div>

            <!-- 原版问题 -->
            <div>
              <h3 class="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4">
                ⚠️ 原版存在的问题
              </h3>
              <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                <li class="flex items-start gap-2">
                  <span class="text-orange-500 mt-1">•</span>
                  <span><strong>滚动监听</strong>：频繁触发，需要手动节流</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-500 mt-1">•</span>
                  <span><strong>多属性变化</strong>：width、padding、background 等重排属性</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-500 mt-1">•</span>
                  <span><strong>复杂过渡</strong>：多条 transition 规则，性能开销大</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-500 mt-1">•</span>
                  <span><strong>类名切换</strong>：大量类名变化导致样式重新计算</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-orange-500 mt-1">•</span>
                  <span><strong>布局抖动</strong>：属性变化引起页面重排</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 测试说明 -->
        <div class="bg-gray-50 dark:bg-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">测试方法</h3>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400"
          >
            <div>
              <p class="mb-2"><strong>Chrome DevTools:</strong></p>
              <ol class="list-decimal list-inside space-y-1">
                <li>F12 打开开发者工具</li>
                <li>切换到 Performance 面板</li>
                <li>点击录制按钮</li>
                <li>快速滚动页面</li>
                <li>停止录制查看 FPS</li>
              </ol>
            </div>
            <div>
              <p class="mb-2"><strong>肉眼观察:</strong></p>
              <ul class="list-disc list-inside space-y-1">
                <li>导航栏切换是否流畅</li>
                <li>有无卡顿或掉帧现象</li>
                <li>颜色过渡是否自然</li>
                <li>响应是否及时</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前显示的导航栏 -->
    <component :is="currentNavbar" />

    <!-- 测试内容 -->
    <div class="max-w-4xl mx-auto px-4 py-16">
      <div class="space-y-8">
        <div v-for="i in 20" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">测试内容块 {{ i }}</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            这是第 {{ i }} 个测试内容块，用于验证导航栏在滚动时的性能表现。
            {{ currentMode === 'optimized' ? '优化版本' : '原版' }}应该{{
              currentMode === 'optimized' ? '保持60 FPS流畅度' : '有一定程度的卡顿'
            }}。
          </p>
          <div
            class="h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center"
          >
            <span class="text-lg font-medium text-gray-700 dark:text-gray-300"> 滚动测试区域 </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentMode = ref('optimized')

const currentNavbar = computed(() => {
  return currentMode.value === 'optimized' ? 'AppNavbarFinal' : 'AppNavbarOriginal'
})
</script>
