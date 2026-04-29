<template>
  <div class="bg-white dark:bg-black min-h-screen pb-20">
    <!-- Store Header Section头部分类列表 -->
    <!-- 
      Implemented based on Apple Store design
      Features: Gradient title, category navigation, responsive layout
    -->
    <div class="bg-gray-50 dark:bg-neutral-900 pt-8 md:pt-16 md:pb-8 md:mb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Title and Subtitle Area 标题副标题区域 -->
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-16"
        >
          <div>
            <h1 class="text-5xl font-bold mb-2">
              <span
                class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500"
              >
                商店
              </span>
            </h1>
            <div class="mt-4 text-xl font-medium text-gray-500">
              <span class="text-gray-900 dark:text-white font-bold">佳节到，别具好礼来欢庆。</span>
            </div>
          </div>

          <div class="mt-4 md:mt-0 text-right">
            <a
              href="#"
              class="text-gray-700 text-sm flex items-center gap-1 font-medium hover:text-black md:justify-end"
            >
              查找 Apple Store 零售店
              <div class="i-carbon-chevron-right text-xs" />
            </a>
          </div>
        </div>

        <!-- Product Categories Navigation 产品分类导航 -->
        <div class="relative group">
          <!-- Scrollable container -->
          <div
            class="flex justify-between overflow-x-auto pb-4 no-scrollbar scroll-smooth gap-8 md:gap-0"
          >
            <div
              v-for="category in categories"
              :key="category.name"
              :class="[
                'flex flex-col items-center min-w-[80px] cursor-pointer group/item space-y-3 pb-2 border-b-4 transition-colors',
                selectedCategory === category.name
                  ? 'border-home-accent dark:border-home-accentDark'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
              ]"
              @click="selectedCategory = category.name"
            >
              <!-- Icon/Image Container -->
              <div
                class="h-[78px] p-2 w-auto flex items-end justify-center group-hover/item:-translate-y-1 transition-transform duration-300 ease-out"
              >
                <img
                  :src="category.image"
                  :alt="category.name"
                  class="h-full w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <!-- Label -->
              <span class="text-xs font-medium text-gray-900 dark:text-white">
                {{ category.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 产品系列展示区域 -->
    <div class="bg-white dark:bg-black py-12 md:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 每个系列的展示块 -->
        <div v-if="groupedProducts.length > 0" class="space-y-16 md:space-y-24">
          <div
            v-for="series in groupedProducts"
            :id="`series-${series.categoryId}`"
            :key="series.categoryId"
            class="scroll-mt-20"
          >
            <!-- 系列标题 + 特色产品卡片 -->
            <div class="mb-12">
              <!-- 系列名称标题 -->
              <h2 class="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                {{ series.category }} 系列
              </h2>

              <!-- 第一行：左侧大卡片 + 右侧产品卡片 -->
              <div class="flex flex-col lg:flex-row gap-4 mb-8">
                <!-- 左侧：特色产品大卡片（占3/5宽度） -->
                <div
                  class="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800 rounded-2xl p-8 md:p-12 flex flex-col justify-between min-h-[400px] md:min-h-[420px] w-full lg:w-3/5 flex-shrink-0"
                >
                  <!-- 新品标签 & 系列标题 -->
                  <div>
                    <div
                      v-if="series.featured?.isNew"
                      class="inline-block mb-4 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full"
                    >
                      新品
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                      {{ series.featured?.name || '未命名产品' }}
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                      {{ series.featured?.description || '无描述' }}
                    </p>
                  </div>

                  <!-- 产品图片 -->
                  <div
                    class="flex items-end justify-center w-full overflow-hidden md:h-56 -mr-4 -mb-4"
                  >
                    <img
                      :src="series.featured?.main_image || ''"
                      :alt="series.featured?.name || ''"
                      class="h-auto w-full object-contain"
                    />
                  </div>
                </div>

                <!-- 右侧：第一行的2个小卡片（占2/5宽度） -->
                <div class="w-full lg:w-2/5 grid grid-cols-2 gap-4">
                  <ProductCard
                    v-for="product in series.otherProducts.slice(0, 2)"
                    :key="product.id"
                    :product="product"
                  />
                </div>
              </div>

              <!-- 第二行及以后：完整的产品卡片网格（5列） -->
              <div
                v-if="series.otherProducts.length > 2"
                class="grid grid-cols-2 sm:grid-cols-5 gap-4"
              >
                <ProductCard
                  v-for="product in series.otherProducts.slice(2)"
                  :key="product.id"
                  :product="product"
                />
              </div>
            </div>

            <!-- 分割线 -->
            <div
              v-if="series !== groupedProducts[groupedProducts.length - 1]"
              class="mt-16 md:mt-24 border-t border-gray-200 dark:border-gray-800"
            ></div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-20 text-gray-500 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800"
        >
          <div class="i-carbon-package text-6xl mb-4 text-gray-300 dark:text-gray-600"></div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">暂无商品</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">敬请期待更多产品上线</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCategoryApi } from '~/composables/api/category';
import type { Product } from '~/types/product';

const { list: fetchCategoryList, products: fetchCategoryProducts } = useCategoryApi();

const categories = ref<any[]>([]);

interface SeriesGroup {
  categoryId?: number;
  category: string;
  featured: Product;
  otherProducts: Product[];
}

const selectedCategory = ref<string | null>(null);
const groupedProducts = ref<SeriesGroup[]>([]);

/**
 * 初始化加载数据
 */
onMounted(async () => {
  try {
    const res = await fetchCategoryList();
    console.log('456:', res);
    if (res) {
      categories.value = res.map((item: any) => ({
        name: item.name,
        image: item.imageUrl || '',
        id: item.id
      }));

      const seriesList = await Promise.all(
        categories.value.map(async (item) => {
          const productsRes = await fetchCategoryProducts(item.id, 1, 10);
          const products = productsRes.data || [];
          return {
            categoryId: item.id,
            category: item.name,
            featured: products[0],
            otherProducts: products.slice(1) as Product[]
          } as SeriesGroup;
        })
      );

      groupedProducts.value = seriesList.filter((item) => item.featured);

      if (categories.value.length > 0 && categories.value[0]) {
        selectedCategory.value = categories.value[0]!.name;
      }
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    categories.value = [];
    groupedProducts.value = [];
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
