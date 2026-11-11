<script setup lang="ts">
import type { RecentItem } from '~/types/search';

interface Props {
  items: RecentItem[];
}

defineProps<Props>();

const emit = defineEmits<{
  /** 点击标签，以该关键词发起搜索 */
  select: [keyword: string];
  /** 删除单条最近搜索 */
  remove: [id: string];
  /** 清空全部最近搜索 */
  clear: [];
}>();
</script>

<template>
  <!-- 最近搜索：横向胶囊标签，右侧带删除按钮 -->
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold text-fg">最近搜索</h2>
      <button
        v-if="items.length > 0"
        class="text-[13px] text-fg-subtle hover:text-fg-muted transition-colors cursor-pointer"
        @click="emit('clear')"
      >
        清空
      </button>
    </div>

    <div v-if="items.length > 0" class="flex flex-wrap gap-2.5">
      <div
        v-for="item in items"
        :key="item.id"
        class="inline-flex max-w-full items-center rounded-full border border-line bg-surface text-sm text-fg hover:border-brand"
      >
        <button
          type="button"
          class="inline-flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-l-full pl-3 pr-1 hover:text-brand"
          @click="emit('select', item.keyword)"
        >
          <span class="i-lucide-clock-3 h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
          <span class="truncate">{{ item.keyword }}</span>
        </button>
        <button
          type="button"
          class="grid h-11 w-10 shrink-0 cursor-pointer place-items-center rounded-r-full text-fg-muted hover:text-fg"
          :aria-label="`删除搜索记录：${item.keyword}`"
          @click="emit('remove', item.id)"
        >
          <span class="i-lucide-x h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
    <p v-else class="text-[13px] text-fg-subtle">暂无最近搜索，试着输入关键词吧</p>
  </section>
</template>
