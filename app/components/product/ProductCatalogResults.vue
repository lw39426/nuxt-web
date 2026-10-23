<template>
  <div v-if="series.length > 0" class="space-y-16 md:space-y-24">
    <div v-for="(item, index) in series" :key="item.categoryId">
      <div class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold mb-8 text-fg">
          {{ item.category }}
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            type="button"
            class="col-span-2 md:col-span-3 lg:col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer isolate transform-gpu min-h-[320px] md:min-h-[280px] lg:min-h-[420px] text-left"
            :aria-label="`查看 ${item.category} 分类`"
            @click="emit('select-category', item.categoryId)"
          >
            <UiImage
              v-if="item.categoryImage"
              :src="item.categoryImage"
              :alt="item.category"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              v-else
              class="absolute inset-0 bg-gradient-to-br from-gray-800 to-black transition-transform duration-700 group-hover:scale-105"
            >
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="i-carbon-image text-8xl text-white/10" />
              </div>
            </div>

            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            />

            <div
              class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent dark:ring-[#686868] pointer-events-none z-10"
            />

            <div class="absolute inset-0 p-8 md:p-10 flex flex-col justify-end z-20">
              <h2
                class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight group-hover:text-blue-200 transition-colors"
              >
                {{ item.category }}
              </h2>
              <div
                class="mt-2 flex items-center text-blue-300 font-medium text-sm md:text-base opacity-90 group-hover:opacity-100 transition-opacity"
              >
                探索{{ item.category }}分类系列
                <div
                  class="i-carbon-arrow-right ml-1 transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </button>

          <ProductCard v-for="product in item.products" :key="product.code" :product="product" />
        </div>
      </div>

      <div v-if="index < series.length - 1" class="mt-16 md:mt-24 border-t border-line" />
    </div>
  </div>

  <div
    v-else-if="loading"
    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    aria-busy="true"
  >
    <div v-for="i in 8" :key="i" class="bg-surface rounded-2xl p-4">
      <div class="aspect-[4/5] bg-elevated rounded-xl mb-4 animate-pulse" />
      <div class="h-4 bg-elevated rounded mb-2 animate-pulse w-3/4" />
      <div class="h-3 bg-elevated rounded mb-4 animate-pulse w-1/2" />
      <div class="h-8 bg-elevated rounded animate-pulse w-full" />
    </div>
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center py-20 text-gray-500 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800"
  >
    <div class="i-carbon-search text-6xl mb-4 text-fg-subtle" />
    <h3 class="text-lg font-semibold text-fg mb-2">没有找到匹配的角色</h3>
    <p class="text-sm text-fg-muted">换个筛选条件试试吧</p>
    <div v-if="hasCategoryFilter || hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <button
        v-if="hasActiveFilters"
        type="button"
        class="px-4 py-2 rounded-full bg-accent text-white text-sm hover:opacity-90 cursor-pointer"
        @click="emit('clear-filters')"
      >
        清空筛选
      </button>
      <button
        v-if="hasCategoryFilter"
        type="button"
        class="px-4 py-2 rounded-full border border-line text-fg text-sm hover:bg-surface-muted cursor-pointer"
        @click="emit('show-all')"
      >
        查看全部角色
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductSeriesGroup } from '~/types/product';

defineProps<{
  series: ProductSeriesGroup[];
  hasActiveFilters: boolean;
  hasCategoryFilter: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'clear-filters': [];
  'show-all': [];
  'select-category': [id: number];
}>();
</script>
