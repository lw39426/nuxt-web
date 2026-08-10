<script setup lang="ts">
import type { Product } from '~/types/product';
import ProductCard from '~/components/product/ProductCard.vue';

interface Props {
  hotProducts?: Product[];
  newProducts?: Product[];
  featuredTagName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  hotProducts: () => [],
  newProducts: () => [],
  featuredTagName: '精选推荐'
});

const activeTab = ref<'hot' | 'new' | 'featured'>('hot');

const displayProducts = computed(() => {
  switch (activeTab.value) {
    case 'hot':
      return props.hotProducts.slice(0, 8);
    case 'new':
      return props.newProducts.slice(0, 8);
    default:
      return props.hotProducts.slice(0, 8);
  }
});

const tabs = [
  { key: 'hot' as const, label: '热销榜单', icon: 'i-carbon-fire' },
  { key: 'new' as const, label: '新品上市', icon: 'i-carbon-new' },
  { key: 'featured' as const, label: '精选推荐', icon: 'i-carbon-star' }
];

const smartTags = ['AI推荐', '限时特惠', '会员专享', '品质优选'];
const activeTag = ref(0);
</script>

<template>
  <section
    class="relative py-24 md:py-32 bg-gray-50 dark:bg-[#08070f] overflow-hidden content-visibility-auto"
  >
    <!-- 背景装饰渐变 -->
    <div
      class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-home-accent/5 dark:bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"
    />
    <div
      class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 pointer-events-none"
    />

    <div class="section-container relative z-10">
      <!-- 标题区 -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between mb-4 gap-8">
        <div class="max-w-xl">
          <p class="section-header-label text-home-accent dark:text-blue-400">智能购物</p>
          <h2 class="section-header-title">智能购物体验</h2>
          <p class="section-header-desc">AI驱动的个性化推荐，让每一次浏览都精准触达你的心意</p>
        </div>

        <!-- 标签 -->
        <div class="flex flex-wrap gap-3">
          <button
            v-for="(tag, idx) in smartTags"
            :key="tag"
            class="px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border"
            :class="
              activeTag === idx
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg shadow-black/10 dark:shadow-white/5'
                : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
            "
            @click="activeTag = idx"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- 标签切换 -->
      <div
        class="flex flex-wrap gap-2 bg-white/50 dark:bg-white/5 p-1.5 rounded-2xl w-fit backdrop-blur-sm border border-gray-100 dark:border-white/5"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-500"
          :class="
            activeTab === tab.key
              ? 'bg-white dark:bg-[#121417] text-home-accent dark:text-blue-400 shadow-md border border-gray-100 dark:border-white/10'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          "
          @click="activeTab = tab.key"
        >
          <div
            :class="[tab.icon, activeTab === tab.key ? 'scale-110' : '']"
            class="transition-transform duration-300"
          />
          {{ tab.label }}
        </button>
      </div>

      <!-- 商品网格 -->
      <div
        v-if="displayProducts.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
      >
        <ProductCard v-for="product in displayProducts" :key="product.id" :product="product" />
      </div>

      <!-- 骨架屏 -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        <div v-for="i in 8" :key="i" class="bg-white dark:bg-[#121417] rounded-2xl p-4">
          <div class="aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 animate-pulse" />
          <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-2 animate-pulse w-3/4" />
          <div class="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-4 animate-pulse w-1/2" />
          <div class="flex justify-between items-center">
            <div class="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-16" />
            <div class="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-20" />
          </div>
        </div>
      </div>

      <!-- 查看更多 -->
      <div class="text-center mt-14">
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
        >
          浏览全部商品
          <div class="i-carbon-arrow-right" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 1200px;
}
</style>
