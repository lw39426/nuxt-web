<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';

const tools = [
  {
    title: '商品对比',
    description: '并排查看商品信息，比较细节后再做选择。',
    icon: 'i-carbon-compare',
    to: '/compare',
    action: '开始对比'
  },
  {
    title: 'AI 助手',
    description: '提问了解角色、查找商品，获取选购建议。',
    icon: 'i-carbon-chat-bot',
    to: '/ai-page',
    action: '向助手提问'
  },
  {
    title: '字数统计',
    description: '粘贴一段文字，实时查看字符、正文与行数。',
    icon: 'i-lucide-whole-word',
    to: '/profile/tools/word-count',
    action: '开始统计'
  }
];
</script>

<template>
  <div>
    <PageHeader title="实用工具" subtitle="查找、比较与探索，让喜欢的内容更容易发现" class="mt-2" />
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <NuxtLink
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        class="tool-entry group flex flex-col rounded-2xl border border-line bg-surface p-5 sm:p-6"
      >
        <span
          class="mb-5 flex size-11 items-center justify-center rounded-xl bg-skin-soft text-skin"
          aria-hidden="true"
        >
          <span :class="[tool.icon, 'size-6']" />
        </span>
        <h2 class="text-base font-semibold text-fg">{{ tool.title }}</h2>
        <p class="mt-2 text-sm leading-6 text-fg-muted">{{ tool.description }}</p>
        <span class="mt-6 flex items-center gap-2 text-sm font-medium text-skin">
          {{ tool.action }}<span class="i-carbon-arrow-right size-4" aria-hidden="true" />
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.tool-entry {
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.tool-entry:hover {
  border-color: var(--skin-accent);
  box-shadow: var(--skin-shadow-sm);
}
.tool-entry:focus-visible {
  outline: 2px solid var(--skin-accent);
  outline-offset: 4px;
}
@media (prefers-reduced-motion: reduce) {
  .tool-entry {
    transition: none;
  }
}
</style>
