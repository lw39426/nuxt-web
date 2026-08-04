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

              <!-- 统一的网格布局：响应式适配所有端 -->
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <!-- 左侧/顶部：分类大卡片 (类似博客 Hero 风格) -->
                <div
                  class="col-span-2 md:col-span-3 lg:col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer isolate transform-gpu min-h-[320px] md:min-h-[280px] lg:min-h-[420px]"
                >
                  <!-- 底层背景图 -->
                  <img
                    v-if="series.categoryImage"
                    :src="series.categoryImage"
                    :alt="series.category"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <!-- 如果没有图片时的降级纯色背景 -->
                  <div
                    v-else
                    class="absolute inset-0 bg-gradient-to-br from-gray-800 to-black transition-transform duration-700 group-hover:scale-105"
                  >
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="i-carbon-image text-8xl text-white/10"></div>
                    </div>
                  </div>

                  <!-- 叠加层: 渐变遮罩 (底部深色向上渐变透明) -->
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                  ></div>

                  <!-- 叠加层: 边框效果 (抗锯齿) -->
                  <div
                    class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent dark:ring-[#686868] pointer-events-none z-10"
                  ></div>

                  <!-- 分类内容区 (置于最上层) -->
                  <div class="absolute inset-0 p-8 md:p-10 flex flex-col justify-end z-20">
                    <h2
                      class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight group-hover:text-blue-200 transition-colors"
                    >
                      {{ series.category }}
                    </h2>
                    <div
                      class="mt-2 flex items-center text-blue-300 font-medium text-sm md:text-base opacity-90 group-hover:opacity-100 transition-opacity"
                    >
                      探索系列产品
                      <div
                        class="i-carbon-arrow-right ml-1 transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </div>

                <!-- 产品卡片 -->
                <ProductCard
                  v-for="product in series.products"
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
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">暂无数据</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">敬请期待···</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCategoryApi } from '~/composables/api/category';
import type { Product } from '~/types/product';

const { getProductCateList, getProducts } = useCategoryApi();
// useToast 必须在 setup 同步阶段调用，不能在 await 之后的回调中使用
const toast = useToast();
// 分类列表数据
const categories = ref<any[]>([]);

interface SeriesGroup {
  categoryId?: number;
  category: string;
  categoryImage: string;
  products: Product[];
}
// 当前选中的分类名称
const selectedCategory = ref<string | null>(null);
// 分类产品列表数据
const groupedProducts = ref<SeriesGroup[]>([]);

/**
 * 初始化分类列表
 */
const initializeCategories = async () => {
  try {
    const res = await getProductCateList();
    console.log('获取分类列表:', res);
    if (res) {
      categories.value = res.map((item: any) => ({
        name: item.name,
        image: item.imageUrl || '',
        id: item.id
      }));

      if (categories.value.length > 0 && categories.value[0]) {
        selectedCategory.value = categories.value[0]!.name;
      }
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    categories.value = [];
    toast.add({
      id: 'products-categories-error',
      title: '加载失败',
      description: '分类列表加载失败，请刷新页面重试',
      color: 'error'
    });
  }
};

/**
 * 初始化产品列表
 */
const initializeProducts = async () => {
  try {
    if (categories.value.length === 0) {
      return;
    }

    const seriesList = await Promise.all(
      categories.value.map(async (item) => {
        const productsRes = await getProducts(item.id, { page: 1, pageSize: 10 });
        console.log('获取分类下的产品:', productsRes);
        const products = productsRes.data || [];
        return {
          categoryId: item.id,
          category: item.name,
          categoryImage: item.image,
          products: products as Product[]
        } as SeriesGroup;
      })
    );

    groupedProducts.value = seriesList.filter((item) => item.products.length > 0);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    groupedProducts.value = [];
    toast.add({
      id: 'products-list-error',
      title: '加载失败',
      description: '商品列表加载失败，请刷新页面重试',
      color: 'error'
    });
  }
};

/**
 * 初始化加载数据
 */
onMounted(async () => {
  await initializeCategories();
  await initializeProducts();
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
