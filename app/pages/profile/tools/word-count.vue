<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';

/** 用户输入的文本，实时驱动全部字数统计 */
const text = ref('');

/** 按 Unicode 码点切分，保证中文与 emoji 不被拆成半个字符 */
const characters = (value: string) => [...value];

/** 汇总统计：总字符、去除空白后的正文字符、行数与英文词数 */
const stats = computed(() => {
  const value = text.value;
  const lines = value === '' ? 0 : value.split(/\r\n|\r|\n/).length;
  return {
    total: characters(value).length,
    body: characters(value.replace(/\s+/g, '')).length,
    lines,
    words: (value.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length
  };
});

/** 统计卡片数据源，随输入实时更新 */
const statItems = computed(() => [
  { label: '总字符', value: stats.value.total },
  { label: '正文字符（不含空白）', value: stats.value.body },
  { label: '行数', value: stats.value.lines },
  { label: '英文词数', value: stats.value.words }
]);

/** 清空输入内容 */
function clearText() {
  text.value = '';
}
</script>

<template>
  <div>
    <NuxtLink
      to="/profile/tools"
      class="inline-flex items-center gap-1 text-sm font-medium text-fg-muted transition hover:text-skin focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--skin-accent)]"
    >
      <span class="i-lucide-arrow-left size-4" aria-hidden="true"></span>
      返回实用工具
    </NuxtLink>
    <PageHeader title="字数统计" subtitle="粘贴文字后实时统计字符、正文与行数。" class="mt-3" />

    <label for="word-count-input" class="sr-only">待统计的文字</label>
    <textarea
      id="word-count-input"
      v-model="text"
      rows="10"
      placeholder="在此粘贴或输入文字…"
      class="mt-4 block w-full min-h-56 resize-y rounded-2xl border border-line bg-surface p-4 text-sm leading-6 text-fg placeholder:text-fg-subtle focus:border-skin focus:outline-none"
    ></textarea>

    <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="item in statItems"
        :key="item.label"
        class="rounded-xl border border-line bg-surface p-4"
      >
        <p class="text-xs text-fg-muted">{{ item.label }}</p>
        <p class="mt-1 text-2xl font-bold text-skin tabular-nums">{{ item.value }}</p>
      </div>
    </div>

    <button
      type="button"
      :disabled="!text"
      class="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-fg transition hover:border-[var(--skin-accent)] hover:text-skin disabled:cursor-not-allowed disabled:opacity-50"
      @click="clearText"
    >
      <span class="i-lucide-trash-2 size-4" aria-hidden="true"></span>
      清空
    </button>
  </div>
</template>
