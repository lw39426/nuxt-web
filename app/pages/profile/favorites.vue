<script setup lang="ts">
import { useFavoriteApi } from '~/composables/api/favorite';
import ProductCard from '~/components/product/ProductCard.vue';
import BlogCard from '~/components/BlogCard.vue';
import type { FavoriteItem } from '~/composables/api/favorite';
import type { BlogPost } from '~/types/blog';

const { list } = useFavoriteApi();

const isLoading = ref(true);
const error = ref(false);
const activeTab = ref<'product' | 'article'>('product');
const favorites = ref<FavoriteItem[]>([]);

const productFavorites = computed(() => favorites.value.filter((f) => f.item_type === 'product'));
const articleFavorites = computed(() => favorites.value.filter((f) => f.item_type === 'article'));

const articleToBlogPost = (item: FavoriteItem): BlogPost => ({
  id: item.item_id,
  code: String(item.item_id),
  title: item.item_title,
  excerpt: item.item_description,
  category: '',
  image: item.item_image,
  date: '',
  author: { name: '', role: '', avatar: '' }
});

const loadFavorites = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await list();
    favorites.value = data?.favorites || [];
  } catch (err: any) {
    error.value = true;
    console.error('加载收藏失败:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadFavorites);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">我的收藏</h1>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6">
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'product'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        "
        @click="activeTab = 'product'"
      >
        商品 ({{ productFavorites.length }})
      </button>
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="
          activeTab === 'article'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        "
        @click="activeTab = 'article'"
      >
        文章 ({{ articleFavorites.length }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadFavorites">重试</UButton>
    </div>

    <!-- Empty -->
    <div
      v-else-if="(activeTab === 'product' ? productFavorites : articleFavorites).length === 0"
      class="text-center py-20"
    >
      <div class="i-carbon-favorite text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500">暂无收藏</p>
    </div>

    <!-- Product Grid -->
    <div v-else-if="activeTab === 'product'" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <ProductCard
        v-for="item in productFavorites"
        :key="item.item_id"
        :product="{
          id: item.item_id,
          name: item.item_title,
          main_image: item.item_image,
          price: 0,
          salePrice: 0,
          tags: [],
          images: [],
          code: '',
          description: '',
          stock: 0,
          brand: '',
          category_id: 0,
          favorite_count: 0,
          status: 1,
          create_time: '',
          update_time: '',
          detail_html: '',
          sales: 0,
          sort: 0,
          category_name: ''
        }"
      />
    </div>

    <!-- Article List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BlogCard
        v-for="item in articleFavorites"
        :key="item.item_id"
        :blog-post="articleToBlogPost(item)"
      />
    </div>
  </div>
</template>
