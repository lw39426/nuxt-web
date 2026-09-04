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
      <button
        v-for="item in items"
        :key="item.id"
        class="group inline-flex items-center gap-2 px-4 py-2 bg-surface border border-line rounded-full text-[13px] text-fg hover:border-brand transition-colors cursor-pointer"
        @click="emit('select', item.keyword)"
      >
        <span class="i-lucide-clock-3 w-3.5 h-3.5 text-fg-subtle" />
        {{ item.keyword }}
        <span
          class="i-lucide-x w-3.5 h-3.5 text-fg-subtle group-hover:text-fg transition-colors"
          role="button"
          aria-label="删除该搜索记录"
          @click.stop="emit('remove', item.id)"
        />
      </button>
    </div>
    <p v-else class="text-[13px] text-fg-subtle">暂无最近搜索，试着输入关键词吧</p>
  </section>
</template>
