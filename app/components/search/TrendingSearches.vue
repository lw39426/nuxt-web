<script setup lang="ts">
import type { TrendingItem } from '~/types/search';

interface Props {
  items: TrendingItem[];
}

defineProps<Props>();

const emit = defineEmits<{
  select: [keyword: string];
}>();

/** 排名配色：1/2/3 名分别为红 / 橙 / 黄，其余弱化 */
const rankClass: Record<number, string> = {
  1: 'text-red-400',
  2: 'text-orange-400',
  3: 'text-yellow-400'
};
</script>

<template>
  <!-- 热门搜索：双列排名卡片 -->
  <section>
    <h2 class="text-base font-semibold text-fg mb-4">🔥 热门搜索</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="item in items"
        :key="item.rank"
        class="flex items-center gap-3 px-4 py-3.5 bg-surface border border-transparent rounded-xl text-left cursor-pointer transition-all duration-200 hover:border-brand hover:-translate-y-px hover:shadow-md"
        @click="emit('select', item.keyword)"
      >
        <span
          class="w-6 text-center shrink-0"
          :class="[
            item.rank <= 3
              ? ['text-lg font-bold', rankClass[item.rank]]
              : 'text-sm font-semibold text-fg-subtle'
          ]"
        >
          {{ item.rank }}
        </span>
        <span class="flex-1 truncate text-sm text-fg">{{ item.keyword }}</span>
        <span class="shrink-0 text-xs text-fg-subtle">{{ item.count }}</span>
      </button>
    </div>
  </section>
</template>
