<script setup lang="ts">
interface Props {
  /** 骨架变体:模拟商品卡(带图块)或文章卡(纯文字) */
  variant?: 'product' | 'article';
}

withDefaults(defineProps<Props>(), { variant: 'product' });
</script>

<template>
  <!-- 骨架屏:结构模拟真实卡片 -->
  <div class="p-4 bg-surface rounded-2xl">
    <!-- 商品变体:左图块 + 右三行文字 -->
    <div v-if="variant === 'product'" class="flex gap-4">
      <div class="shrink-0 w-[120px] h-[120px] skeleton-shimmer rounded-xl" />
      <div class="flex-1 flex flex-col gap-2.5 py-1">
        <div class="h-4 w-16 skeleton-shimmer rounded-md" />
        <div class="h-5 w-3/4 skeleton-shimmer rounded-md" />
        <div class="h-3.5 w-full skeleton-shimmer rounded-md" />
        <div class="h-3.5 w-2/3 skeleton-shimmer rounded-md" />
        <div class="mt-auto h-9 w-56 skeleton-shimmer rounded-xl" />
      </div>
    </div>

    <!-- 文章变体:四行文字条 -->
    <div v-else class="flex flex-col gap-2.5 py-1">
      <div class="h-4 w-20 skeleton-shimmer rounded-md" />
      <div class="h-5 w-2/3 skeleton-shimmer rounded-md" />
      <div class="h-3.5 w-full skeleton-shimmer rounded-md" />
      <div class="h-3.5 w-5/6 skeleton-shimmer rounded-md" />
      <div class="mt-2 h-7 w-64 skeleton-shimmer rounded-full" />
    </div>
  </div>
</template>
