<script setup lang="ts">
import { SEARCH_CATEGORIES } from '#shared/siteSearch';
import type { SearchEntryType, SiteSearchData } from '#shared/siteSearch';

const props = defineProps<{ data: SiteSearchData; type?: SearchEntryType }>();
const emit = defineEmits<{ selectType: [type?: SearchEntryType]; pageChange: [page: number] }>();
const OVERVIEW_SIZE = 3;

const total = computed(() => props.data.tabs.reduce((sum, tab) => sum + tab.total, 0));
const visibleData = computed(() =>
  props.type
    ? props.data
    : {
        ...props.data,
        tabs: props.data.tabs.map((tab) => ({ ...tab, items: tab.items.slice(0, OVERVIEW_SIZE) }))
      }
);
const media = useSiteSearchCardMedia(() => visibleData.value);
const groups = computed(() => visibleData.value.tabs.filter((tab) => tab.items.length));
const totalPages = computed(() =>
  Math.max(1, ...props.data.tabs.map((tab) => Math.ceil(tab.total / props.data.size)))
);
</script>

<template>
  <div>
    <p class="mb-5 break-words text-sm text-fg-muted" role="status">
      「<span class="font-medium text-fg">{{ data.q }}</span
      >」有 {{ total }} 条{{ type ? SEARCH_CATEGORIES[type].label : '' }}结果
    </p>

    <section v-if="!groups.length" class="border-y border-line py-12 text-center">
      <span class="i-lucide-search-x mb-3 h-7 w-7 text-fg-muted" aria-hidden="true" />
      <h2 class="text-lg font-semibold text-fg">
        {{ total ? '这一页没有结果' : '没有找到相关结果' }}
      </h2>
      <p v-if="!total" class="mt-2 text-sm text-fg-muted">试试更短的关键词，或搜索其他名称。</p>
      <button
        v-if="type"
        type="button"
        class="mt-4 cursor-pointer text-sm font-semibold text-brand hover:underline"
        @click="emit('selectType')"
      >
        查看全部分类
      </button>
      <button
        v-if="data.page > 1"
        type="button"
        class="mx-3 mt-4 cursor-pointer text-sm font-semibold text-brand hover:underline"
        @click="emit('pageChange', 1)"
      >
        返回第 1 页
      </button>
    </section>

    <section v-for="tab in groups" :key="tab.entry_type" class="mb-7">
      <h2 v-if="type" class="sr-only">{{ SEARCH_CATEGORIES[tab.entry_type].label }}</h2>
      <div
        v-if="!type"
        class="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-line"
      >
        <h2 class="text-base font-semibold text-fg">
          {{ SEARCH_CATEGORIES[tab.entry_type].label }}
        </h2>
        <button
          v-if="tab.total > tab.items.length || data.page > 1"
          type="button"
          class="inline-flex min-h-11 cursor-pointer items-center gap-1 text-sm font-medium text-fg hover:underline"
          @click="emit('selectType', tab.entry_type)"
        >
          查看全部 {{ tab.total }} 条{{ SEARCH_CATEGORIES[tab.entry_type].label }}
          <span class="i-lucide-arrow-right h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <ul
        :class="
          tab.entry_type === 'character' ? 'mt-3 grid gap-2 sm:grid-cols-2 sm:gap-3' : 'result-list'
        "
      >
        <li v-for="item in tab.items" :key="item.id">
          <SearchSiteSearchResult :item="item" :media="media.get(item)" />
        </li>
      </ul>
    </section>

    <template v-if="type && groups.length && totalPages > 1">
      <SearchPagination
        :page="data.page"
        :total-pages="totalPages"
        @change="emit('pageChange', $event)"
      />
      <nav
        class="flex items-center justify-between gap-2 border-t border-line pt-4 text-sm md:hidden"
        aria-label="分页"
      >
        <button
          type="button"
          class="min-h-11 cursor-pointer rounded-lg border border-line px-3 disabled:cursor-default disabled:opacity-40"
          :disabled="data.page <= 1"
          @click="emit('pageChange', data.page - 1)"
        >
          上一页
        </button>
        <span class="tabular-nums text-fg-muted">{{ data.page }} / {{ totalPages }}</span>
        <button
          type="button"
          class="min-h-11 cursor-pointer rounded-lg border border-line px-3 disabled:cursor-default disabled:opacity-40"
          :disabled="data.page >= totalPages"
          @click="emit('pageChange', data.page + 1)"
        >
          下一页
        </button>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.result-list > li + li {
  border-top: 1px solid var(--line);
}
</style>
