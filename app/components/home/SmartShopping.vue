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

const smartTags = ['AI推荐', '限时特惠', '会员专享', '品质优选'];
const activeTag = ref(0);
</script>

<template>
  <section
    class="relative py-24 md:py-32 bg-canvas-elevated overflow-hidden content-visibility-auto"
  >
    <!-- 背景装饰渐变 -->
    <div
      class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-soft rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"
    />
    <div
      class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 pointer-events-none"
    />

    <div class="section-container relative z-10">
      <!-- 标题区 -->
      <UiSectionHeader
        class="mb-6"
        tone="accent"
        label="智能购物"
        title="智能购物体验"
        description="AI驱动的个性化推荐，让每一次浏览都精准触达你的心意"
      >
        <!-- 标签 -->
        <template #actions>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="(tag, idx) in smartTags"
              :key="tag"
              class="px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border"
              :class="
                activeTag === idx
                  ? 'bg-fg text-canvas border-fg shadow-lg shadow-black/10 dark:shadow-white/5'
                  : 'bg-surface text-fg-muted border-line hover:border-line-strong'
              "
              @click="activeTag = idx"
            >
              {{ tag }}
            </button>
          </div>
        </template>
      </UiSectionHeader>

      <!-- 商品网格 -->
      <div
        v-if="displayProducts.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
      >
        <ProductCard v-for="product in displayProducts" :key="product.code" :product="product" />
      </div>

      <!-- 骨架屏 -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        <div v-for="i in 8" :key="i" class="bg-surface rounded-2xl p-4">
          <div class="aspect-[4/5] bg-elevated rounded-xl mb-4 animate-pulse" />
          <div class="h-4 bg-elevated rounded mb-2 animate-pulse w-3/4" />
          <div class="h-3 bg-elevated rounded mb-4 animate-pulse w-1/2" />
          <div class="flex justify-between items-center">
            <div class="h-5 bg-elevated rounded animate-pulse w-16" />
            <div class="h-8 bg-elevated rounded animate-pulse w-20" />
          </div>
        </div>
      </div>

      <!-- 查看更多 -->
      <div class="text-center mt-14">
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 px-8 py-3 bg-surface border border-line rounded-full text-sm font-medium text-fg hover:bg-surface-muted transition-all duration-300"
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
