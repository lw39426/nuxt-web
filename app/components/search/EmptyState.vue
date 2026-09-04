<script setup lang="ts">
import type { RecommendationProduct } from '~/types/search';
import { ZERO_RESULT_RECOMMENDS } from '~/utils/searchMock';

interface Props {
  /** 无结果时的搜索关键词 */
  keyword: string;
}

defineProps<Props>();

const emit = defineEmits<{
  /** 清除筛选条件并重试 */
  'clear-filters': [];
  /** 提交需求(演示) */
  'submit-request': [];
}>();

/** 空结果推荐(4 个精简商品) */
const recommends: RecommendationProduct[] = ZERO_RESULT_RECOMMENDS;
</script>

<template>
  <!-- 无结果状态:居中提示 + 推荐内容 + 操作按钮 -->
  <div class="py-[60px] flex flex-col items-center text-center">
    <!-- 大图标 -->
    <span class="i-lucide-search-x w-16 h-16 text-line-strong" aria-hidden="true" />

    <!-- 主文案 -->
    <p class="mt-5 text-base text-fg-muted">
      未找到与「<span class="text-fg font-semibold">{{ keyword }}</span
      >」相关的内容
    </p>
    <p class="mt-1.5 text-sm text-fg-subtle">试试更换关键词,或调整筛选条件后再搜索</p>

    <!-- 推荐内容 -->
    <p class="mt-8 text-sm font-semibold text-fg">为您推荐以下热门内容</p>
    <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[560px]">
      <div
        v-for="item in recommends"
        :key="item.id"
        class="flex items-center gap-3 p-3 bg-surface border border-line rounded-xl transition-all duration-200 hover:border-brand hover:shadow-md cursor-pointer"
      >
        <span
          class="shrink-0 w-11 h-11 flex items-center justify-center bg-surface-muted rounded-lg text-2xl select-none"
          aria-hidden="true"
        >
          {{ item.emoji }}
        </span>
        <div class="min-w-0 text-left">
          <p class="truncate text-[13px] font-medium text-fg">{{ item.name }}</p>
          <p class="mt-0.5 text-sm">
            <span class="font-bold text-fg">¥{{ item.price }}</span>
            <span v-if="item.originalPrice" class="ml-1.5 text-xs text-fg-subtle line-through">
              ¥{{ item.originalPrice }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- 操作按钮行 -->
    <div class="mt-8 flex items-center gap-3">
      <button
        class="text-sm text-brand hover:opacity-80 transition-opacity cursor-pointer"
        @click="emit('clear-filters')"
      >
        清除筛选条件
      </button>
      <button
        class="h-9 px-5 bg-fg text-canvas rounded-xl text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
        @click="emit('submit-request')"
      >
        提交需求
      </button>
    </div>
  </div>
</template>
