<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const isScrolled = ref(false)
const sentinelRef = ref(null) // 哨兵元素的引用

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleScroll = () => {
  // 当滚动超过 20px 时切换状态
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  // window.addEventListener('scroll', handleScroll)
  // 创建观察者
  const observer = new IntersectionObserver(
    ([entry]) => {
      // 如果哨兵看不见了 (entry.isIntersecting === false)，说明页面往下滚了
      isScrolled.value = !entry.isIntersecting
    },
    {
      root: null,
      threshold: 0,
      rootMargin: '40px 0px 0px 0px' // 稍微往下滚一点点再触发，避免敏感抖动
    }
  )
  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }
})

onUnmounted(() => {
  // window.removeEventListener('scroll', handleScroll)
  observer.disconnect()
})

// 定义动态类名，保持 template 干净
const containerClasses = computed(() => {
  console.log('我在滑动', isScrolled.value)
  const baseClasses = 'w-full mx-auto transition-all duration-500 relative flex items-center justify-between'

  if (isScrolled.value) {
    // === 滚动后的胶囊状态 (State B) ===
    // 对应你提供的: max-w-3xl bg-white/90 rounded-3xl shadow-xl backdrop-blur py-4 ring-1...
    return `${baseClasses} max-w-3xl bg-white/90 dark:bg-neutral-900/60 rounded-3xl shadow-xl backdrop-blur-md py-3 px-6 ring-1 ring-neutral-100 dark:ring-white/10 mt-2`
  } else {
    // === 初始全宽状态 (State A) ===
    // 对应你提供的: max-w-(--ui-container) px-4 sm:px-6 lg:px-8
    return `${baseClasses} max-w-7xl px-4 sm:px-6 lg:px-8 py-2`
  }
})
</script>

<template>
  <!-- 
    最外层：Sticky 定位
    对应原代码: class="sticky w-full top-0 z-50 py-2 sm:py-4 px-2 sm:px-0" 
  -->
  <!-- 1. 哨兵元素：绝对定位在顶部，肉眼不可见 -->
  <div ref="sentinelRef" class="absolute top-0 left-0 h-4 w-full pointer-events-none bg-transparent"></div>
  <div class="sticky w-full top-0 z-50 py-2 sm:py-4 px-2 sm:px-0">
    <nav class="relative">
      <!-- 
        变形的核心容器 
        class 通过 containerClasses 动态切换
      -->
      <div :class="containerClasses">
        <!-- 左侧 Logo -->
        <a href="/" class="flex items-center gap-2">
          <!-- 替换为你的 Logo 图片 -->
          <div class="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white">
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
            href="#"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >Blog</a
          >
          <a
            href="#"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >Features</a
          >
          <a
            href="#"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >Pricing</a
          >
          <a
            href="#"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >Docs</a
          >
        </div>

        <!-- 右侧 Sign In 按钮 -->
        <div class="flex items-center gap-2">
          <!-- 
            复刻原版那个很酷的 Sign In 按钮效果 
            group-hover 时灰色圆圈背景会变宽
          -->
          <a href="/auth/login" class="h-8 items-center justify-center relative mr-2 group hidden md:flex pl-4">
            <div class="flex gap-2 items-center relative z-20 text-sm font-medium text-gray-900 dark:text-white">
              <span class="mr-2">Sign In</span>
              <!-- Arrow Icon -->
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

          <!-- 移动端菜单按钮 (汉堡包) -->
          <button class="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  </div>

  <!-- 用于测试滚动的占位内容 -->
  <!-- <div class="h-[120vh] bg-gray-50 pt-20 px-8">
    <h1 class="text-4xl font-bold mb-4">向下滚动查看导航栏变形效果 -></h1>
    <p>这个页面很长...</p>
  </div> -->
</template>
