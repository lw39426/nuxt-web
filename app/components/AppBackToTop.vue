<script setup lang="ts">
/**
 * 回到顶部按钮：独立图标按钮（吸附屏幕右缘、悬浮菜单下方）
 * - 滚动检测沿用 IO 哨兵方案：文档顶部放高 240px 哨兵，
 *   其完全滚出视口（等价 scrollY > 240）时按钮滑入显示
 * - 相比 window scroll 监听，IO 回调仅在状态跨越阈值时触发，滚动过程中不占主线程
 */
const showBackToTop = ref(false);
const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

/**
 * IntersectionObserver 回调函数
 * 当哨兵元素与视口的相交状态发生变化时触发
 * @param entries - 相交观测条目数组
 */
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  // 取第一个观测条目（本组件只 observe 一个哨兵元素），安全访问避免数组为空的情况
  const entry = entries[0];
  if (entry) {
    // 哨兵与视口无交集 = 已滚过顶部 240px，显示回到顶部按钮
    showBackToTop.value = !entry.isIntersecting;
  }
};

/**
 * 平滑滚动回文档顶部
 */
const backToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  // observe 后立即触发一次回调，天然完成初始落位（无需额外手动判断一次滚动位置）
  observer = new IntersectionObserver(handleIntersection, {
    root: null,
    threshold: 0
  });

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <!-- 滚动哨兵：贴在文档顶部、高 240px。不可见、不占位、不拦截事件，仅供 IntersectionObserver 观测。 -->
  <div
    ref="sentinelRef"
    class="absolute top-0 left-0 h-[240px] w-full pointer-events-none bg-transparent"
    aria-hidden="true"
  ></div>

  <!-- 回到顶部：吸附右缘的半圆图标按钮，位于悬浮菜单触发器下方
       定位基准与悬浮菜单一致（top:90% 恰为设置按钮底缘），下移 0.75rem 间距，
       避免不同视口高度下与设置按钮重叠 -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-x-8"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition-all duration-300 ease-in-out"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-8"
  >
    <button
      v-show="showBackToTop"
      class="fixed top-[calc(90%_+_0.75rem)] right-0 z-50 w-8 h-12 bg-glass backdrop-blur-sm border border-r-0 border-line rounded-l-full shadow-[-2px_0_8px_rgba(0,0,0,0.05)] flex items-center justify-center text-fg-muted hover:text-fg hover:bg-elevated hover:w-10 transition-all duration-300 cursor-pointer group"
      aria-label="回到顶部"
      title="回到顶部"
      @click="backToTop"
    >
      <div class="i-carbon-arrow-up text-lg group-hover:-translate-y-0.5 transition-transform" />
    </button>
  </Transition>
</template>
