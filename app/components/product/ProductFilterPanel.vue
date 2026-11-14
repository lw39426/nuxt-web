<template>
  <div class="bg-canvas">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
      <ProductCategoryPager
        :categories="categories"
        :selected-category-id="selectedCategoryId"
        @select="emit('select-category', $event)"
      />
    </div>
  </div>

  <section
    v-if="availableGroups.length || activeFilterCount"
    aria-label="角色筛选"
    class="bg-canvas border-b border-line"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p class="text-sm text-fg-muted" role="status">
          当前显示
          <strong class="text-fg font-semibold tabular-nums">{{ resultCount }}</strong> 位角色
        </p>
        <div class="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          <button
            v-if="activeFilterCount"
            type="button"
            class="min-h-11 shrink-0 rounded-lg px-2 text-sm text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
            @click="emit('clear-filters')"
          >
            重置
          </button>
          <button
            v-if="availableGroups.length"
            type="button"
            class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm font-medium text-fg hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent"
            :aria-expanded="filtersOpen"
            :aria-controls="filterPanelId"
            @click="filtersOpen = !filtersOpen"
          >
            <span class="i-lucide-sliders-horizontal size-4" aria-hidden="true" />
            {{ filtersOpen ? '收起筛选' : '筛选' }}
            <span
              v-if="activeFilterCount"
              class="rounded-full bg-brand-soft px-1.5 text-xs tabular-nums"
              :aria-label="`已选 ${activeFilterCount} 项`"
            >
              {{ activeFilterCount }}
            </span>
            <span
              class="i-carbon-chevron-down size-4"
              :class="{ 'rotate-180': filtersOpen }"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div v-if="activeFilterCount" class="mt-2 flex flex-wrap items-center gap-1.5 py-1">
        <span
          v-for="tag in activeTags"
          :key="`${tag.key}-${tag.value}`"
          class="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-soft py-0.5 pl-2.5 pr-1 text-xs text-fg"
        >
          <span class="shrink-0">{{ tag.label }}</span>
          <span class="min-w-0 break-words font-medium">{{ tag.value }}</span>
          <button
            type="button"
            class="grid size-7 shrink-0 place-items-center rounded-full hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
            :aria-label="`移除${tag.label}筛选 ${tag.value}`"
            @click="emit('toggle-filter', tag.key, tag.value)"
          >
            <span class="i-carbon-close w-4 h-4 inline-block" />
          </button>
        </span>
      </div>

      <div
        v-show="filtersOpen && availableGroups.length"
        :id="filterPanelId"
        class="filter-panel mt-3 space-y-3 rounded-xl border border-line bg-surface p-3 sm:space-y-4 sm:px-5 sm:py-4"
      >
        <div
          role="tablist"
          aria-label="筛选类别"
          class="inline-flex max-w-full rounded-xl bg-surface-muted p-1 align-top"
          @keydown="onTabKeydown"
        >
          <div class="relative isolate flex" :style="{ '--active-tab': activeGroupIndex }">
            <span
              aria-hidden="true"
              class="filter-tab-indicator pointer-events-none absolute inset-y-0 left-0 -z-10 rounded-lg bg-surface shadow-sm"
            />
            <button
              v-for="group in availableGroups"
              :id="`${filterPanelId}-tab-${group.key}`"
              :key="group.key"
              type="button"
              role="tab"
              class="filter-tab inline-flex min-h-10 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 text-sm font-medium motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              :class="activeGroupKey === group.key ? 'text-fg' : 'text-fg-muted hover:text-fg'"
              :aria-selected="activeGroupKey === group.key"
              :aria-controls="`${filterPanelId}-group-${group.key}`"
              :tabindex="activeGroupKey === group.key ? 0 : -1"
              @click="selectedGroupKey = group.key"
            >
              {{ group.label }}
              <span v-if="selectedFilters[group.key].length" class="text-xs tabular-nums">
                {{ selectedFilters[group.key].length }}
              </span>
            </button>
          </div>
        </div>
        <div
          v-for="group in availableGroups"
          v-show="activeGroupKey === group.key"
          :id="`${filterPanelId}-group-${group.key}`"
          :key="group.key"
          role="tabpanel"
          :aria-labelledby="`${filterPanelId}-tab-${group.key}`"
          class="filter-tab-panel min-w-0"
        >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in group.options"
              :key="option"
              type="button"
              class="min-h-10 max-w-full break-words rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              :class="
                isSelected(group.key, option)
                  ? 'border-accent bg-brand-soft font-semibold text-fg'
                  : 'border-line text-fg-muted hover:bg-surface-muted hover:text-fg'
              "
              :aria-pressed="isSelected(group.key, option)"
              @click="emit('toggle-filter', group.key, option)"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  ProductActiveFilterTag,
  ProductCatalogFilters,
  ProductCategory,
  ProductFilterKey,
  ProductFilterOptionGroup
} from '~/types/product';

const props = defineProps<{
  categories: ProductCategory[];
  selectedCategoryId: number | null;
  filterGroups: ProductFilterOptionGroup[];
  selectedFilters: ProductCatalogFilters;
  activeTags: ProductActiveFilterTag[];
  activeFilterCount: number;
  resultCount: number;
}>();

const emit = defineEmits<{
  'select-category': [id: number | null];
  'toggle-filter': [key: ProductFilterKey, option: string];
  'clear-filters': [];
}>();

const filtersOpen = shallowRef(false);
const filterPanelId = useId();
const availableGroups = computed(() => props.filterGroups.filter((group) => group.options.length));
const selectedGroupKey = shallowRef<ProductFilterKey>();
const activeGroupIndex = computed(() =>
  Math.max(
    0,
    availableGroups.value.findIndex((group) => group.key === selectedGroupKey.value)
  )
);
const activeGroupKey = computed(() => availableGroups.value[activeGroupIndex.value]?.key);

function onTabKeydown(event: KeyboardEvent) {
  const groups = availableGroups.value;
  const current = activeGroupIndex.value;

  let next: number;
  switch (event.key) {
    case 'ArrowLeft':
      next = (current + groups.length - 1) % groups.length;
      break;
    case 'ArrowRight':
      next = (current + 1) % groups.length;
      break;
    case 'Home':
      next = 0;
      break;
    case 'End':
      next = groups.length - 1;
      break;
    default:
      return;
  }

  const group = groups[next];
  if (!group) return;
  event.preventDefault();
  selectedGroupKey.value = group.key;
  document.getElementById(`${filterPanelId}-tab-${group.key}`)?.focus();
}

function isSelected(key: ProductFilterKey, option: string): boolean {
  return props.selectedFilters[key].includes(option);
}
</script>

<style scoped>
.filter-panel {
  --filter-tab-width: 4.25rem;
  /* 控制选中底色滑动速度 */
  --filter-tab-slide-duration: 240ms;
  /* 控制内容面板显示速度 */
  --filter-tab-content-duration: 180ms;
}

@media (min-width: 640px) {
  .filter-panel {
    --filter-tab-width: 5.5rem;
  }
}

.filter-tab,
.filter-tab-indicator {
  width: var(--filter-tab-width);
}

.filter-tab-indicator {
  transform: translateX(calc(var(--active-tab) * 100%));
}

@media (prefers-reduced-motion: no-preference) {
  .filter-tab-indicator {
    transition: transform var(--filter-tab-slide-duration) cubic-bezier(0.22, 1, 0.36, 1);
  }

  .filter-tab-panel {
    animation: filter-tab-enter var(--filter-tab-content-duration) ease-out both;
  }
}

@keyframes filter-tab-enter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
