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

  <div
    v-if="activeFilterCount || filterGroups.some((group) => group.options.length)"
    class="bg-canvas border-b border-line"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 py-3 md:py-5">
      <div
        v-for="group in filterGroups.filter((item) => item.options.length > 0)"
        :key="group.key"
        class="flex items-start gap-3"
      >
        <span class="w-12 md:w-16 shrink-0 pt-2 text-xs md:text-sm font-medium text-fg-muted">
          {{ group.label }}
        </span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in group.options"
            :key="option"
            type="button"
            class="min-h-9 px-3 py-1.5 rounded-full text-xs md:text-sm border transition-colors"
            :class="
              isSelected(group.key, option)
                ? 'bg-accent text-white border-accent'
                : 'text-fg border-line hover:bg-accent hover:text-white hover:border-accent'
            "
            :aria-pressed="isSelected(group.key, option)"
            @click="emit('toggle-filter', group.key, option)"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <div v-if="activeFilterCount > 0" class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="tag in activeTags"
            :key="`${tag.key}-${tag.value}`"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-white text-sm"
          >
            <span class="text-xs">{{ tag.label }}</span>
            <span class="text-xs text-[#efefef]">{{ tag.value }}</span>
            <button
              type="button"
              class="ml-0.5 rounded-full hover:bg-accent/20 transition-colors p-0.5 grid place-items-center cursor-pointer"
              :aria-label="`移除筛选条件: ${tag.value}`"
              @click="emit('toggle-filter', tag.key, tag.value)"
            >
              <span class="i-carbon-close w-4 h-4 inline-block" />
            </button>
          </span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="text-sm text-fg-muted">
            当前显示
            <span class="text-fg font-semibold">{{ resultCount }}</span>
            位角色
          </span>
          <UButton
            class="bg-btn-lpurple text-btn-lpurple-text hover:bg-btn-lpurple-hover"
            variant="soft"
            size="sm"
            @click="emit('clear-filters')"
          >
            <template #leading>
              <span class="i-carbon-reset w-4 h-4" />
            </template>
            重置筛选
          </UButton>
        </div>
      </div>
    </div>
  </div>
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

function isSelected(key: ProductFilterKey, option: string): boolean {
  return props.selectedFilters[key].includes(option);
}
</script>
