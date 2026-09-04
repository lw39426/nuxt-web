<script setup lang="ts">
import type { CategoryShortcut } from '~/types/search';

interface Props {
  items: CategoryShortcut[];
}

defineProps<Props>();

const emit = defineEmits<{
  select: [item: CategoryShortcut];
}>();
</script>

<template>
  <!-- 分类快捷入口：四宫格卡片，点击以分类关键词搜索 -->
  <section>
    <h2 class="text-base font-semibold text-fg mb-4">按分类浏览</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        v-for="item in items"
        :key="item.name"
        class="p-6 bg-surface border border-transparent rounded-2xl text-center cursor-pointer transition-all duration-200 hover:border-brand hover:-translate-y-0.5 hover:shadow-lg"
        @click="emit('select', item)"
      >
        <span
          class="w-12 h-12 mx-auto flex items-center justify-center bg-brand-soft rounded-xl text-2xl"
          aria-hidden="true"
        >
          {{ item.emoji }}
        </span>
        <p class="mt-3 text-sm font-semibold text-fg">{{ item.name }}</p>
        <p class="mt-1 text-xs text-fg-subtle">{{ item.count }}</p>
      </button>
    </div>
  </section>
</template>
