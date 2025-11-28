<script setup></script>

<template>
  <!-- 哨兵元素：触发滚动状态 -->
  <div
    ref="sentinelRef"
    class="absolute top-0 left-0 h-4 w-full pointer-events-none bg-transparent z-0"
  ></div>

  <!-- 外层容器：sticky 定位 -->
  <div class="sticky top-0 z-50 w-full">
    <nav class="relative flex justify-center pt-2 sm:pt-4"></nav>
  </div>
</template>
