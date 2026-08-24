<template>
  <div class="group relative flex flex-col h-full">
    <!-- Image Container -->
    <div
      class="relative w-full h-[160px] sm:h-[256px] aspect-[4/5] overflow-hidden bg-surface-muted rounded-xl"
    >
      <NuxtLink :to="productDetailPath" class="block w-full h-full mx-auto">
        <img
          :src="product?.main_image || ''"
          :alt="product?.name || ''"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-contain p-4 sm:p-8"
        />
      </NuxtLink>

      <!-- Floating Actions -->
      <div
        class="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
      >
        <!-- Favorite Button -->
        <button
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface shadow-md flex items-center justify-center text-fg-subtle hover:text-red-500 hover:bg-elevated transition-colors"
          @click.stop="toggleFavorite"
        >
          <div
            :class="[
              isFavorite ? 'i-carbon-favorite-filled text-red-500' : 'i-carbon-favorite',
              'text-base sm:text-xl'
            ]"
          />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="pt-3 flex flex-col flex-1">
      <div class="mb-1 sm:mb-2 flex items-center gap-2 flex-wrap">
        <span class="text-[10px] sm:text-xs font-medium text-fg-subtle uppercase tracking-wider">{{
          product.brand || 'Brand'
        }}</span>
        <span
          v-for="tag in product.tags"
          :key="tag.id"
          class="text-[10px] px-1.5 py-0.5 rounded text-white"
          :style="{ backgroundColor: tag.color || '#3b82f6' }"
        >
          {{ tag.name }}
        </span>
      </div>
      <NuxtLink :to="productDetailPath" class="block mb-1 sm:mb-2">
        <h3
          class="text-sm sm:text-base font-medium text-fg group-hover:text-fg-muted line-clamp-2 transition-colors"
        >
          {{ product?.name }}
        </h3>
      </NuxtLink>

      <div class="mt-auto">
        <div class="flex items-end justify-between mb-3">
          <div class="flex flex-col">
            <div class="flex items-baseline gap-2">
              <span class="text-base sm:text-lg font-bold text-fg">¥{{ currentPrice }}</span>
              <span v-if="hasDiscount" class="text-xs text-fg-subtle line-through"
                >¥{{ originalPrice }}</span
              >
            </div>
            <div class="flex items-center gap-2 mt-0.5 sm:mt-1">
              <span class="text-[10px] sm:text-xs text-fg-subtle"
                >销量: {{ product.sales || 0 }}</span
              >
              <span class="text-[10px] sm:text-xs text-fg-subtle"
                >库存: {{ product.stock || 0 }}</span
              >
            </div>
          </div>
        </div>

        <!-- Add to Bag Button -->
        <button
          class="w-full py-2 border border-fg rounded-lg text-xs sm:text-sm font-medium hover:bg-fg hover:text-canvas transition-colors"
          @click.stop="addToCart"
        >
          Add to bag
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';

const props = defineProps<{
  product: Product;
}>();
// console.log(props.product);
const isFavorite = ref(false);
const productDetailPath = computed(() => `/products/${props.product.code || props.product.id}`);

/** 价格格式化（假设接口返回单位为分） */
const formatPrice = (price?: number) => {
  if (!price) return '0.00';
  return price.toFixed(2);
};

const hasDiscount = computed(() => {
  return props.product.salePrice > 0 && props.product.salePrice < props.product.price;
});

const currentPrice = computed(() => {
  const price = hasDiscount.value ? props.product.salePrice : props.product.price;
  return formatPrice(price);
});

const originalPrice = computed(() => {
  return formatPrice(props.product.price);
});

/** 切换当前商品的收藏状态 */
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
};

/** 将当前商品加入购物车 */
const addToCart = () => {
  // Implement add to cart logic
  if (import.meta.dev) {
    console.log('Added to cart:', props.product?.name);
  }
};
</script>
