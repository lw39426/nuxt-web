<template>
  <div class="bg-canvas-elevated pb-4 md:pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative" role="group" aria-label="按作品分类筛选">
        <div class="flex justify-between overflow-x-auto pb-4 no-scrollbar gap-2 md:gap-0">
          <!-- 分类-全部 -->
          <button
            type="button"
            class="flex flex-col items-center min-w-[64px] md:min-w-[80px] cursor-pointer group/item space-y-3 pb-2 border-b-4 bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :class="
              selectedCategoryId === null
                ? 'border-accent'
                : 'border-transparent hover:border-line-strong'
            "
            :aria-pressed="selectedCategoryId === null"
            @click="emit('select-category', null)"
          >
            <span
              class="h-[64px] w-[64px] p-2 md:h-[78px] md:w-[78px] flex items-end justify-center text-fg-muted group-hover/item:-translate-y-1 transition-transform duration-300 ease-out"
              aria-hidden="true"
            >
              <span class="i-carbon-grid text-4xl" />
            </span>
            <span class="text-[10px] md:text-xs font-medium text-fg">全部</span>
          </button>
          <!-- 分类-后端分类列表项 -->
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            class="flex flex-col items-center min-w-[64px] md:min-w-[80px] cursor-pointer group/item space-y-3 pb-2 border-b-4 bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :class="
              selectedCategoryId === category.id
                ? 'border-accent'
                : 'border-transparent hover:border-line-strong'
            "
            :aria-pressed="selectedCategoryId === category.id"
            @click="emit('select-category', category.id)"
          >
            <div
              class="h-[64px] w-[64px] p-1 md:h-[78px] md:w-auto md:p-2 flex items-end justify-center group-hover/item:-translate-y-1 transition-transform duration-300 ease-out"
            >
              <UiImage
                :src="category.image"
                :alt="category.name"
                class="h-full w-full md:w-auto object-contain"
                loading="lazy"
              />
            </div>
            <span class="max-w-full text-[10px] md:text-xs font-medium text-fg truncate">{{
              category.name
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-canvas py-6 md:py-8 border-b border-line">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      <div
        v-for="group in filterGroups.filter((item) => item.options.length > 0)"
        :key="group.key"
        class="flex items-start gap-3"
      >
        <span class="w-16 shrink-0 pt-1.5 text-sm font-medium text-fg-muted">
          {{ group.label }}
        </span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in group.options"
            :key="option"
            type="button"
            class="px-3 py-1.5 rounded-full text-sm border transition-colors"
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

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
