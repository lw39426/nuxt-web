<script setup lang="ts">
import { onClickOutside, useLocalStorage, useMediaQuery } from '@vueuse/core';
import type { FilterState, RecentItem, SearchTab, SortKey } from '~/types/search';
import {
  CATEGORY_SHORTCUTS,
  DEFAULT_RECENT,
  FILTER_DEFAULT,
  PAGE_SIZE,
  TRENDING_SEARCHES,
  buildFilterChips,
  filterAndSortResults,
  getExpandedPool,
  getSearchDirect,
  getSuggestions
} from '~/utils/searchMock';

useSeoMeta({ title: '搜索中心' });

/* ---------- 基础状态 ---------- */
/** 输入框内容(未提交) */
const query = shallowRef('');
/** 已提交关键词 */
const submittedKeyword = shallowRef('');
/** 输入框聚焦中 */
const isFocused = shallowRef(false);
/** 是否执行过搜索(推导 empty/results 两态) */
const hasSearched = shallowRef(false);
/** 模拟请求 loading */
const isLoading = shallowRef(false);
/** 筛选状态 */
const filters = ref<FilterState>({ ...FILTER_DEFAULT });
/** 排序键 */
const sort = shallowRef<SortKey>('relevance');
/** 当前页码 */
const currentPage = shallowRef(1);
/** 最近搜索(useLocalStorage 持久化,SSR 下用初始种子) */
const recentList = useLocalStorage<RecentItem[]>('search-recent', [...DEFAULT_RECENT], {
  initOnMounted: true
});
/** 移动端筛选抽屉开关 */
const showFilterDrawer = shallowRef(false);
/** loading 定时器句柄(卸载时清理) */
let loadingTimer: ReturnType<typeof setTimeout> | null = null;

/** 结果区容器引用(分页后平滑滚动定位) */
const resultAreaRef = useTemplateRef<HTMLDivElement>('resultArea');
/** 搜索栏容器引用(外部点击关闭联想下拉) */
const searchBarRef = useTemplateRef<HTMLDivElement>('searchBar');
/** 是否为移动端视口(<768px):移动端用"加载更多"累加,桌面端用分页切片 */
const isMobile = useMediaQuery('(max-width: 767px)');

/* ---------- 派生状态 ---------- */
/** typing 本质是下拉可见性:聚焦且有输入 */
const showDropdown = computed(() => isFocused.value && query.value.trim().length > 0);
/** 页面布局只有 empty / results 两态 */
const searchState = computed<'empty' | 'results'>(() => (hasSearched.value ? 'results' : 'empty'));

/** Tab 与 filters.types 双向派生,避免两处状态失同步 */
const activeTab = computed<SearchTab>({
  get: () => (filters.value.types.length === 1 ? filters.value.types[0]! : 'all'),
  set: (tab) => {
    filters.value = { ...filters.value, types: tab === 'all' ? [] : [tab] };
  }
});

/** 联想列表(mock 同步数据直接算;接真实接口时改 useDebounceFn + AbortController) */
const suggestions = computed(() => getSuggestions(query.value));
/** 搜索直达卡片 */
const direct = computed(() => getSearchDirect(query.value));

/* ---------- 结果管线 ---------- */
/** 结果池(128 条,模块级缓存) */
const pool = getExpandedPool();
/** 全量结果:关键词 + 筛选 + 排序 */
const allResults = computed(() =>
  filterAndSortResults(pool, submittedKeyword.value, filters.value, sort.value)
);
/** 总页数 */
const totalPages = computed(() => Math.max(1, Math.ceil(allResults.value.length / PAGE_SIZE)));
/** 当前页结果:桌面端按页切片,移动端"加载更多"累加展示前 N 页 */
const pageResults = computed(() => {
  const end = currentPage.value * PAGE_SIZE;
  const start = isMobile.value ? 0 : end - PAGE_SIZE;
  return allResults.value.slice(start, end);
});
/** 无结果态 */
const isEmpty = computed(
  () => hasSearched.value && !isLoading.value && allResults.value.length === 0
);
/** 已选筛选胶囊 */
const chips = computed(() => buildFilterChips(filters.value));

/* ---------- 行为 ---------- */
/**
 * 执行搜索:提交关键词、重置页码、记录最近搜索(去重置顶、上限 8)、模拟 600ms loading
 */
function doSearch(keyword?: string) {
  const kw = (keyword ?? query.value).trim();
  if (!kw) return;
  query.value = kw;
  submittedKeyword.value = kw;
  hasSearched.value = true;
  currentPage.value = 1;
  isFocused.value = false;
  recordRecent(kw);
  simulateLoading();
}

/** 记录最近搜索:去重置顶、上限 8 条 */
function recordRecent(kw: string) {
  const next = [
    { id: `r-${Date.now()}`, keyword: kw },
    ...recentList.value.filter((item) => item.keyword !== kw)
  ];
  recentList.value = next.slice(0, 8);
}

/** 模拟请求 loading(600ms),重复搜索时重置计时 */
function simulateLoading() {
  if (loadingTimer) clearTimeout(loadingTimer);
  isLoading.value = true;
  loadingTimer = setTimeout(() => {
    isLoading.value = false;
    loadingTimer = null;
  }, 600);
}

/** 删除单条最近搜索 */
function removeRecent(id: string) {
  recentList.value = recentList.value.filter((item) => item.id !== id);
}

/** 清空最近搜索 */
function clearRecent() {
  recentList.value = [];
}

/**
 * 删除筛选胶囊:按 key 前缀还原对应筛选项
 * type→[]、price→默认区间、rating→null、tag:xx→移除该标签
 */
function removeChip(key: string) {
  if (key === 'type') {
    filters.value = { ...filters.value, types: [] };
  } else if (key === 'price') {
    filters.value = {
      ...filters.value,
      priceRange: [...FILTER_DEFAULT.priceRange] as [number, number]
    };
  } else if (key === 'rating') {
    filters.value = { ...filters.value, rating: null };
  } else if (key.startsWith('tag:')) {
    const tag = key.slice(4);
    filters.value = { ...filters.value, tags: filters.value.tags.filter((t) => t !== tag) };
  }
}

/** 清空全部筛选 */
function clearFilters() {
  filters.value = { ...FILTER_DEFAULT };
}

/** 热门标签点击:以标签为关键词搜索 */
function searchByTag(tag: string) {
  doSearch(tag);
}

/** 分页变更后平滑滚动到结果区顶部 */
function onPageChange() {
  const top = resultAreaRef.value
    ? resultAreaRef.value.getBoundingClientRect().top + window.scrollY - 120
    : 0;
  window.scrollTo({ top, behavior: 'smooth' });
}

/** 点击搜索栏外部关闭联想下拉 */
onClickOutside(searchBarRef, () => {
  isFocused.value = false;
});

// 筛选/排序变化即时生效(computed 已覆盖),页码需重置
watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);
watch(sort, () => {
  currentPage.value = 1;
});

// 组件卸载时清理 loading 计时器
onUnmounted(() => {
  if (loadingTimer) clearTimeout(loadingTimer);
});
</script>

<template>
  <div class="min-h-screen bg-canvas-elevated">
    <!-- 顶部搜索栏:吸顶在全局导航栏下方(fixed 高 72/80px) -->
    <div ref="searchBar" class="sticky top-[72px] md:top-[80px] z-30">
      <SearchBar
        v-model:query="query"
        v-model:active-tab="activeTab"
        :suggestions="suggestions"
        :direct="direct"
        :show-dropdown="showDropdown"
        @search="doSearch()"
        @focus-change="(focused) => (isFocused = focused)"
        @select-suggestion="(item) => doSearch(item.title)"
        @select-direct="(item) => doSearch(item.name)"
      />
    </div>

    <main class="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
      <!-- 状态一:搜索前(最近搜索 / 热门搜索 / 分类入口) -->
      <div v-if="searchState === 'empty'" class="max-w-[900px] mx-auto space-y-10">
        <SearchRecentSearches
          :items="recentList"
          @select="(kw) => doSearch(kw)"
          @remove="removeRecent"
          @clear="clearRecent"
        />
        <SearchTrendingSearches :items="TRENDING_SEARCHES" @select="(kw) => doSearch(kw)" />
        <SearchCategoryShortcuts
          :items="CATEGORY_SHORTCUTS"
          @select="(item) => doSearch(item.keyword)"
        />
      </div>

      <!-- 状态三:搜索后,三栏布局 -->
      <div v-else class="flex items-start gap-6">
        <!-- 左:筛选侧栏(lg 以上,sticky) -->
        <div class="hidden lg:block w-[220px] shrink-0 sticky top-[140px]">
          <SearchFilterSidebar v-model="filters" />
        </div>

        <!-- 中:结果区 -->
        <div ref="resultArea" class="flex-1 min-w-0">
          <!-- 移动端/平板:筛选按钮(打开抽屉) -->
          <button
            class="mb-3 lg:hidden inline-flex items-center gap-1.5 h-9 px-4 bg-surface border border-line rounded-xl text-[13px] text-fg hover:border-brand transition-colors cursor-pointer"
            @click="showFilterDrawer = true"
          >
            <span class="i-lucide-sliders-horizontal w-4 h-4 text-fg-muted" aria-hidden="true" />
            筛选
            <span
              v-if="chips.length"
              class="px-1.5 py-px bg-brand-soft text-brand rounded-full text-xs"
            >
              {{ chips.length }}
            </span>
          </button>

          <SearchResultHeader
            v-model:sort="sort"
            :total="allResults.length"
            :chips="chips"
            @remove-chip="removeChip"
            @clear-filters="clearFilters"
          />

          <Transition name="fade">
            <!-- loading:骨架屏 -->
            <div v-if="isLoading" key="loading" class="flex flex-col gap-4">
              <SearchSkeletonCard
                v-for="i in 4"
                :key="i"
                :variant="i % 3 === 0 ? 'article' : 'product'"
              />
            </div>

            <!-- 无结果 -->
            <SearchEmptyState
              v-else-if="isEmpty"
              key="empty"
              :keyword="submittedKeyword"
              @clear-filters="clearFilters"
              @submit-request="() => {}"
            />

            <!-- 结果列表 -->
            <div v-else key="list" class="flex flex-col gap-4">
              <template v-for="item in pageResults" :key="item.id">
                <SearchProductCard
                  v-if="item.type === 'product'"
                  :product="item"
                  @favorite="() => {}"
                  @detail="() => {}"
                />
                <SearchArticleCard v-else :article="item" @detail="() => {}" />
              </template>
            </div>
          </Transition>

          <!-- 分页(桌面/平板);移动端为"加载更多" -->
          <SearchPagination
            v-if="!isEmpty && !isLoading && totalPages > 1"
            v-model:page="currentPage"
            :total-pages="totalPages"
            @change="onPageChange"
          />
          <button
            v-if="!isEmpty && !isLoading && currentPage < totalPages"
            class="md:hidden w-full h-10 bg-surface border border-line rounded-xl text-sm text-fg hover:border-brand transition-colors cursor-pointer"
            @click="currentPage++"
          >
            加载更多
          </button>
        </div>

        <!-- 右:推荐栏(lg 以上,sticky) -->
        <div class="hidden lg:block w-[240px] shrink-0 sticky top-[140px]">
          <SearchRecommendationSidebar @select-tag="searchByTag" @select-product="() => {}" />
        </div>
      </div>
    </main>

    <!-- 移动端筛选抽屉:底部滑出,内复用同一个 FilterSidebar -->
    <Teleport to="body">
      <Transition name="drawer">
        <div
          v-if="showFilterDrawer"
          class="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="筛选条件"
        >
          <!-- 遮罩 -->
          <div class="absolute inset-0 bg-[var(--overlay)]" @click="showFilterDrawer = false" />
          <!-- 抽屉面板 -->
          <div
            class="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto bg-canvas rounded-t-2xl p-4 pb-6"
          >
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-semibold text-fg">筛选条件</h2>
              <button
                class="w-8 h-8 flex items-center justify-center text-fg-muted hover:text-fg transition-colors cursor-pointer"
                aria-label="关闭筛选"
                @click="showFilterDrawer = false"
              >
                <span class="i-lucide-x w-5 h-5" />
              </button>
            </div>
            <SearchFilterSidebar v-model="filters" hide-title />
            <button
              class="mt-4 w-full h-11 bg-fg text-canvas rounded-xl text-sm font-medium hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
              @click="showFilterDrawer = false"
            >
              查看 {{ allResults.length }} 个结果
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* 三状态切换 fade 过渡 200ms */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端筛选抽屉滑入/滑出 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s;
}
.drawer-enter-active .absolute,
.drawer-leave-active .absolute {
  transition: transform 0.25s;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
