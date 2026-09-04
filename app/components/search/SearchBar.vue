<script setup lang="ts">
import type { SearchDirectItem, SearchSuggestion, SearchTab } from '~/types/search';

interface Props {
  /** 联想列表 */
  suggestions: SearchSuggestion[];
  /** 搜索直达卡片（未命中为 null） */
  direct: SearchDirectItem | null;
  /** 是否展示联想下拉（父组件依据 focus + 关键词推导） */
  showDropdown: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  search: [];
  'select-suggestion': [item: SearchSuggestion];
  'select-direct': [item: SearchDirectItem];
  /** 输入框聚焦状态变化（父组件用于推导 searchState） */
  'focus-change': [focused: boolean];
}>();

/** 搜索词：v-model 双向绑定 */
const query = defineModel<string>('query', { default: '' });
/** 分类 Tab：v-model 双向绑定（由父组件从筛选条件派生） */
const activeTab = defineModel<SearchTab>('activeTab', { default: 'all' });

const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

const tabs: { value: SearchTab; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'product', label: '📦 产品' },
  { value: 'article', label: '📝 文章' }
];

function onFocus() {
  emit('focus-change', true);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') emit('search');
  if (event.key === 'Escape') {
    emit('focus-change', false);
    inputRef.value?.blur();
  }
}

function clearQuery() {
  query.value = '';
  inputRef.value?.focus();
}
</script>

<template>
  <!-- 顶部搜索栏：sticky 定位样式由父组件透传（跟随全局导航栏下方） -->
  <header class="bg-surface border-b border-line">
    <div class="max-w-[900px] mx-auto px-4 sm:px-8 py-4 md:py-5">
      <div class="flex items-center gap-6">
        <!-- 标题（移动端隐藏） -->
        <h1 class="hidden md:block shrink-0 text-xl font-bold text-fg">🔍 搜索中心</h1>

        <!-- 搜索框区域 -->
        <div class="relative flex-1">
          <span
            class="absolute left-4 top-1/2 -translate-y-1/2 i-lucide-search w-5 h-5 text-fg-subtle pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref="inputRef"
            v-model="query"
            type="search"
            class="w-full h-12 pl-12 pr-[100px] bg-canvas border-2 border-line rounded-2xl text-sm text-fg placeholder:text-fg-subtle outline-none transition-all duration-200 focus:border-brand focus:ring-[3px] focus:ring-brand-soft [&::-webkit-search-cancel-button]:hidden"
            placeholder="搜索产品、文章或帮助文档，如 Nuxt4 教程"
            aria-label="搜索产品、文章或帮助文档"
            @focus="onFocus"
            @keydown="onKeydown"
          />
          <!-- 清除按钮：输入有内容时显示 -->
          <button
            v-show="query.length > 0"
            class="absolute right-[88px] top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-fg-subtle hover:text-fg-muted transition-colors cursor-pointer"
            aria-label="清空搜索词"
            @click="clearQuery"
          >
            <span class="i-lucide-x w-4 h-4" />
          </button>
          <!-- 搜索按钮 -->
          <button
            class="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-5 bg-fg text-canvas rounded-xl text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            @click="emit('search')"
          >
            搜索
          </button>

          <!-- 搜索中：联想下拉面板 -->
          <SearchSuggestionDropdown
            v-if="showDropdown"
            :keyword="query"
            :direct="direct"
            :suggestions="suggestions"
            @select-suggestion="emit('select-suggestion', $event)"
            @select-direct="emit('select-direct', $event)"
            @search="emit('search')"
          />
        </div>
      </div>

      <!-- 分类 Tab：选中态黑底白字胶囊 -->
      <nav class="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar" aria-label="搜索分类">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="shrink-0 px-4 py-1.5 rounded-full text-[13px] transition-colors cursor-pointer"
          :class="
            activeTab === tab.value
              ? 'bg-fg text-canvas font-medium'
              : 'bg-surface-muted text-fg-muted hover:bg-line'
          "
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
