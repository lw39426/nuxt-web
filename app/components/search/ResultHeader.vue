<script setup lang="ts">
import type { FilterChip, SortKey } from '~/types/search';

interface Props {
  /** 结果总数 */
  total: number;
  /** 已选筛选胶囊列表 */
  chips: FilterChip[];
}

defineProps<Props>();

const emit = defineEmits<{
  /** 切换排序 */
  'update:sort': [value: SortKey];
  /** 删除单个筛选胶囊 */
  'remove-chip': [key: string];
  /** 清空全部筛选 */
  'clear-filters': [];
}>();

/** 排序:v-model 双向绑定 */
const sort = defineModel<SortKey>('sort', { default: 'relevance' });

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: '综合排序' },
  { value: 'latest', label: '最新发布' },
  { value: 'hottest', label: '热度最高' },
  { value: 'price-asc', label: '价格从低到高' }
];

/** 切换排序时上抛 update 事件(v-model 已同步,显式 emit 便于父级监听) */
function onChangeSort(value: SortKey) {
  emit('update:sort', value);
}
</script>

<template>
  <!-- 结果头:左侧计数 + 右侧已选胶囊与排序 -->
  <div class="flex items-center justify-between gap-4 mb-4">
    <p class="text-sm text-fg-muted shrink-0">
      找到 <span class="text-fg font-bold">{{ total }}</span> 个相关结果
    </p>

    <div class="flex items-center gap-3 min-w-0">
      <!-- 已选筛选胶囊 -->
      <div v-if="chips.length" class="flex items-center gap-2 min-w-0 flex-wrap justify-end">
        <button
          v-for="chip in chips"
          :key="chip.key"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-soft text-brand rounded-full text-xs font-medium transition-colors cursor-pointer hover:opacity-80"
          :aria-label="`移除筛选:${chip.label}`"
          @click="emit('remove-chip', chip.key)"
        >
          {{ chip.label }}
          <span class="i-lucide-x w-3 h-3" aria-hidden="true" />
        </button>
        <button
          v-if="chips.length > 1"
          class="text-xs text-fg-subtle hover:text-fg-muted transition-colors cursor-pointer shrink-0"
          @click="emit('clear-filters')"
        >
          清空
        </button>
      </div>

      <!-- 竖分隔线(有胶囊时) -->
      <span v-if="chips.length" class="w-px h-4 bg-line shrink-0" aria-hidden="true" />

      <!-- 排序下拉 -->
      <select
        v-model="sort"
        class="shrink-0 border border-line rounded-lg px-3 py-1.5 text-[13px] text-fg bg-surface outline-none focus:border-brand cursor-pointer"
        aria-label="排序方式"
        @change="onChangeSort(sort)"
      >
        <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>
  </div>
</template>
