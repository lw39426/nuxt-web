<script setup lang="ts">
const {
  categories,
  selectedCategoryId,
  selectedFilters,
  filterGroups,
  series,
  activeFilterTags,
  activeFilterCount,
  filteredCharacterCount,
  totalCharacters,
  categoryLoading,
  hasActiveFilters,
  hasCategoryFilter,
  selectCategory,
  toggleFilter,
  clearFilters,
  showAllCategories
} = await useProductCatalog();

useSeoMeta({
  title: '角色图鉴',
  description:
    '浏览 YouMi 角色图鉴，按作品系列、角色类型、年代与标签筛选，收录动漫与影视中的海量角色档案、能力设定与人物关系。'
});
</script>

<template>
  <div class="bg-canvas min-h-screen pb-20">
    <ProductCatalogHeader :total-characters="totalCharacters" />

    <ProductFilterPanel
      :categories="categories"
      :selected-category-id="selectedCategoryId"
      :filter-groups="filterGroups"
      :selected-filters="selectedFilters"
      :active-tags="activeFilterTags"
      :active-filter-count="activeFilterCount"
      :result-count="filteredCharacterCount"
      @select-category="selectCategory"
      @toggle-filter="toggleFilter"
      @clear-filters="clearFilters"
    />

    <div class="bg-canvas py-8 md:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCatalogResults
          :series="series"
          :has-active-filters="hasActiveFilters"
          :has-category-filter="hasCategoryFilter"
          :loading="categoryLoading"
          @clear-filters="clearFilters"
          @show-all="showAllCategories"
          @select-category="selectCategory"
        />
      </div>
    </div>
  </div>
</template>
