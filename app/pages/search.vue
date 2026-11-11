<script setup lang="ts">
import { SEARCH_CATEGORIES } from '#shared/siteSearch';
import type { SearchEntryType } from '#shared/siteSearch';

definePageMeta({ hideAiEntry: true });
useSeoMeta({ title: '站内搜索' });

const {
  keyword,
  type,
  draft,
  validation,
  data,
  categoryTotals,
  error,
  pending,
  recent,
  submit,
  reset,
  retry,
  selectType,
  goToPage,
  removeRecent,
  clearRecent
} = useSiteSearch();

const categories: { key?: SearchEntryType; label: string }[] = [
  { label: '全部' },
  ...(['character', 'product', 'article'] as const).map((key) => ({
    key,
    label: SEARCH_CATEGORIES[key].label
  }))
];
const suggestions = ['胡桃', '原神', 'Mintlify'];
const browseLinks = [
  {
    label: '原神角色',
    hint: '按地区探索角色',
    to: '/character/mondstadt',
    icon: 'i-lucide-users-round'
  },
  { label: '商品图鉴', hint: '浏览作品与系列', to: '/products', icon: 'i-lucide-package' },
  { label: '文章', hint: '浏览站内文章', to: '/blog', icon: 'i-lucide-file-text' }
];
const allTotal = computed(() => {
  const { character, product, article } = categoryTotals.value;
  if (character === undefined || product === undefined || article === undefined) return undefined;
  return character + product + article;
});
const results = useTemplateRef<HTMLElement>('results');
const searchForm = useTemplateRef('searchForm');

function chooseType(entryType?: SearchEntryType) {
  void selectType(entryType);
  if (!keyword.value) searchForm.value?.focus();
}

async function changePage(page: number) {
  await goToPage(page);
  results.value?.focus({ preventScroll: true });
  results.value?.scrollIntoView({ block: 'start' });
}

function showCategory(entryType?: SearchEntryType) {
  void selectType(entryType).then(() => {
    results.value?.focus({ preventScroll: true });
    results.value?.scrollIntoView({ block: 'start' });
  });
}
</script>

<template>
  <main class="bg-canvas px-4 pb-10 sm:min-h-[78vh] sm:px-8 sm:pb-20">
    <div class="search-layout mx-auto" :class="{ 'search-layout-idle': !keyword }">
      <header class="search-heading" :class="{ 'search-heading-idle': !keyword }">
        <h1
          :class="keyword ? 'sr-only' : 'text-2xl font-semibold tracking-tight text-fg sm:sr-only'"
        >
          站内搜索
        </h1>
        <SearchSiteSearchForm
          ref="searchForm"
          v-model="draft"
          :error="validation"
          :has-results="Boolean(keyword)"
          :class="keyword ? 'mt-3' : 'mt-4 sm:mt-8'"
          @submit="submit()"
          @clear="reset"
        />

        <nav
          class="search-scopes flex flex-wrap gap-x-1 sm:gap-x-3"
          :class="keyword ? 'mt-3 border-b border-line' : 'mt-3 justify-center'"
          aria-label="搜索范围"
        >
          <button
            v-for="category in categories"
            :key="category.label"
            type="button"
            class="scope-button"
            :aria-pressed="type === category.key"
            @click="chooseType(category.key)"
          >
            {{ category.label }}
            <span
              v-if="(category.key ? categoryTotals[category.key] : allTotal) !== undefined"
              class="text-xs tabular-nums text-fg-muted"
              >{{ category.key ? categoryTotals[category.key] : allTotal }}</span
            >
          </button>
        </nav>
      </header>

      <div v-if="!keyword && recent.length" class="mt-6 border-t border-line pt-4 sm:mt-8 sm:pt-5">
        <SearchRecentSearches
          :items="recent"
          @select="submit"
          @remove="removeRecent"
          @clear="clearRecent"
        />
      </div>

      <div v-if="!keyword" class="mt-6 space-y-6 sm:hidden">
        <section v-if="!recent.length && !type" aria-labelledby="search-suggestions">
          <h2 id="search-suggestions" class="mb-2 text-sm font-semibold text-fg">试试搜索</h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              type="button"
              class="min-h-11 cursor-pointer rounded-full border border-line px-4 text-sm text-fg hover:bg-surface-muted"
              @click="submit(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </section>

        <section aria-labelledby="search-browse">
          <h2 id="search-browse" class="mb-2 text-sm font-semibold text-fg">按分类浏览</h2>
          <ul class="overflow-hidden rounded-2xl border border-line">
            <li v-for="link in browseLinks" :key="link.to" class="border-line [&+li]:border-t">
              <NuxtLink
                :to="link.to"
                class="flex min-h-15 items-center gap-3 px-3 py-2 hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
              >
                <span
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-fg"
                  aria-hidden="true"
                >
                  <span :class="link.icon" class="h-4 w-4" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-medium text-fg">{{ link.label }}</span>
                  <span class="mt-0.5 block text-xs text-fg-muted">{{ link.hint }}</span>
                </span>
                <span
                  class="i-lucide-chevron-right h-4 w-4 shrink-0 text-fg-muted"
                  aria-hidden="true"
                />
              </NuxtLink>
            </li>
          </ul>
        </section>
      </div>

      <section
        v-if="keyword"
        ref="results"
        aria-label="搜索结果"
        tabindex="-1"
        class="scroll-mt-24 pt-5 outline-none"
      >
        <div v-if="pending" role="status">
          <p class="text-sm text-fg-muted">正在搜索…</p>
          <div
            v-for="row in 3"
            :key="row"
            class="flex items-center gap-4 border-b border-line py-4"
            aria-hidden="true"
          >
            <div class="h-12 w-12 shrink-0 rounded-lg bg-surface-muted" />
            <div class="flex-1 space-y-2">
              <div class="h-3 w-1/3 rounded bg-surface-muted" />
              <div class="h-3 w-1/2 rounded bg-surface-muted" />
            </div>
          </div>
        </div>
        <div v-else-if="error" role="alert" class="py-9 text-center">
          <p class="text-sm font-medium text-fg">{{ error }}</p>
          <button
            type="button"
            class="mt-3 min-h-11 cursor-pointer rounded-full border border-line px-5 text-sm font-semibold hover:bg-surface-muted"
            @click="retry"
          >
            重试
          </button>
        </div>
        <SearchSiteSearchResults
          v-else-if="data"
          :data="data"
          :type="type"
          @select-type="showCategory"
          @page-change="changePage"
        />
      </section>
    </div>
  </main>
</template>

<style scoped>
.search-layout {
  max-width: 52rem;
  padding-top: 5.5rem;
}

.search-layout-idle {
  max-width: 39rem;
  padding-top: clamp(7rem, 20vh, 12rem);
}

.search-heading-idle {
  text-align: center;
}

@media (width < 640px) {
  .search-layout {
    padding-top: 1rem;
  }

  .search-layout-idle {
    padding-top: 1.5rem;
  }

  .search-heading-idle {
    text-align: left;
  }
}

.scope-button {
  position: relative;
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.3rem;
  padding-inline: 0.65rem;
  color: var(--fg-muted);
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;
}

.scope-button:hover,
.scope-button[aria-pressed='true'] {
  color: var(--fg);
}

.scope-button[aria-pressed='true'] {
  font-weight: 600;
}

.search-layout-idle .scope-button {
  border-radius: 999px;
  padding-inline: 0.875rem;
}

.search-layout-idle .scope-button[aria-pressed='true'] {
  background: var(--brand-soft);
}

.search-layout:not(.search-layout-idle) .scope-button[aria-pressed='true']::after {
  position: absolute;
  inset: auto 0 -1px;
  height: 2px;
  background: var(--brand);
  content: '';
}
</style>
