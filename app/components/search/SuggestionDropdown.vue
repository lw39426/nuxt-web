<script setup lang="ts">
import type { SearchDirectItem, SearchSuggestion } from '~/types/search';

interface Props {
  /** 联想关键词（用于高亮匹配部分） */
  keyword: string;
  /** 搜索直达卡片（未命中为 null） */
  direct: SearchDirectItem | null;
  /** 分类联想列表 */
  suggestions: SearchSuggestion[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** 点击联想项 */
  'select-suggestion': [item: SearchSuggestion];
  /** 点击搜索直达卡片 */
  'select-direct': [item: SearchDirectItem];
  /** 点击底部提示 / 直接搜索 */
  search: [];
}>();

interface HighlightParts {
  before: string;
  match: string;
  after: string;
}

/** 按关键词拆分标题，用于 <strong> 高亮匹配片段（避免 v-html） */
function splitHighlight(title: string, keyword: string): HighlightParts | null {
  const kw = keyword.trim();
  if (!kw) return null;
  const idx = title.toLowerCase().indexOf(kw.toLowerCase());
  if (idx === -1) return null;
  return {
    before: title.slice(0, idx),
    match: title.slice(idx, idx + kw.length),
    after: title.slice(idx + kw.length)
  };
}

const decoratedSuggestions = computed(() =>
  props.suggestions.map((item) => ({ item, parts: splitHighlight(item.title, props.keyword) }))
);
const productSuggestions = computed(() =>
  decoratedSuggestions.value.filter((d) => d.item.type === 'product')
);
const articleSuggestions = computed(() =>
  decoratedSuggestions.value.filter((d) => d.item.type === 'article')
);
</script>

<template>
  <!-- 联想下拉面板：覆盖在页面内容之上，最大宽度与搜索框对齐 -->
  <div
    class="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-[420px] overflow-y-auto bg-surface border border-line rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
  >
    <!-- 搜索直达区 -->
    <div v-if="direct" class="mx-3 mt-3 rounded-xl bg-brand-soft px-4 py-3.5">
      <p class="flex items-center gap-1.5 text-xs font-semibold text-brand mb-2.5">
        <span class="w-1.5 h-1.5 rounded-full bg-brand" aria-hidden="true" />
        搜索直达
      </p>
      <div class="flex items-center gap-4">
        <span
          class="w-12 h-12 shrink-0 flex items-center justify-center bg-surface rounded-xl text-2xl"
          aria-hidden="true"
        >
          {{ direct.emoji }}
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-[15px] font-bold text-fg truncate">{{ direct.name }}</p>
          <p class="mt-0.5 text-[13px] text-fg-muted truncate">{{ direct.description }}</p>
        </div>
        <div class="shrink-0 flex items-center gap-3">
          <div class="text-right">
            <p class="text-base font-bold text-fg">¥{{ direct.price }}</p>
            <p v-if="direct.originalPrice" class="text-xs text-fg-subtle line-through">
              ¥{{ direct.originalPrice }}
            </p>
          </div>
          <button
            class="h-9 px-4 bg-brand hover:bg-brand-hover active:bg-brand-active text-on-brand rounded-xl text-[13px] font-medium transition-colors cursor-pointer"
            @click="emit('select-direct', direct)"
          >
            查看
          </button>
        </div>
      </div>
    </div>

    <!-- 分类联想列表：按类型分组 -->
    <template v-if="productSuggestions.length || articleSuggestions.length">
      <div v-if="productSuggestions.length" class="mt-2">
        <p class="px-5 py-3 text-xs font-semibold text-fg-subtle bg-surface-muted">产品</p>
        <button
          v-for="{ item, parts } in productSuggestions"
          :key="item.id"
          class="w-full flex items-center gap-3 px-5 py-2.5 text-left cursor-pointer hover:bg-surface-muted transition-colors"
          @click="emit('select-suggestion', item)"
        >
          <span class="i-lucide-package w-4 h-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          <span class="flex-1 min-w-0 truncate text-sm text-fg">
            <template v-if="parts">
              {{ parts.before }}<strong class="text-brand font-semibold">{{ parts.match }}</strong
              >{{ parts.after }}
            </template>
            <template v-else>{{ item.title }}</template>
          </span>
          <span class="shrink-0 px-2 py-0.5 text-xs text-fg-subtle bg-surface-muted rounded-md"
            >产品</span
          >
        </button>
      </div>
      <div v-if="articleSuggestions.length">
        <p class="px-5 py-3 text-xs font-semibold text-fg-subtle bg-surface-muted">文章</p>
        <button
          v-for="{ item, parts } in articleSuggestions"
          :key="item.id"
          class="w-full flex items-center gap-3 px-5 py-2.5 text-left cursor-pointer hover:bg-surface-muted transition-colors"
          @click="emit('select-suggestion', item)"
        >
          <span class="i-lucide-file-text w-4 h-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          <span class="flex-1 min-w-0 truncate text-sm text-fg">
            <template v-if="parts">
              {{ parts.before }}<strong class="text-brand font-semibold">{{ parts.match }}</strong
              >{{ parts.after }}
            </template>
            <template v-else>{{ item.title }}</template>
          </span>
          <span class="shrink-0 px-2 py-0.5 text-xs text-fg-subtle bg-surface-muted rounded-md"
            >文章</span
          >
        </button>
      </div>
    </template>

    <!-- 无联想结果时的兜底提示 -->
    <p v-else-if="!direct" class="px-5 py-6 text-center text-sm text-fg-subtle">
      未找到与「{{ keyword }}」相关的联想，按 Enter 直接搜索
    </p>

    <!-- 底部提示 -->
    <button
      class="w-full border-t border-line px-5 py-3 text-center text-[13px] text-fg-muted hover:bg-surface-muted transition-colors cursor-pointer"
      @click="emit('search')"
    >
      按 Enter 查看「<strong class="text-fg font-semibold">{{ keyword }}</strong
      >」的全部结果
    </button>
  </div>
</template>
