<template>
  <div class="group relative flex flex-col">
    <!-- Image Container -->
    <div
      class="relative w-full h-[160px] sm:h-[256px] aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-800/50 rounded-xl"
    >
      <NuxtLink :to="`/products/${product.id}`" class="block w-full h-full mx-auto">
        <img
          :src="product.images[0]"
          :alt="product?.title"
          class="w-full h-full object-contain p-4 sm:p-8"
        />
      </NuxtLink>

      <!-- Floating Actions -->
      <div
        class="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
      >
        <!-- Favorite Button -->
        <button
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
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
      <div class="mb-1 sm:mb-2">
        <span class="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">{{
          product.brand || 'Brand'
        }}</span>
      </div>
      <NuxtLink :to="`/products/${product.id}`" class="block mb-1 sm:mb-2">
        <h3
          class="text-sm sm:text-base font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors"
        >
          {{ product?.title }}
        </h3>
      </NuxtLink>

      <div class="mt-auto">
        <div class="flex items-end justify-between mb-3">
          <div class="flex flex-col">
            <span class="text-base sm:text-lg font-bold text-gray-900 dark:text-white"
              >${{ product.price }}</span
            >
            <div class="flex items-center gap-1 mt-0.5 sm:mt-1">
              <div class="flex text-yellow-400 text-[10px] sm:text-xs">
                <div
                  v-for="i in 5"
                  :key="i"
                  :class="
                    i <= Math.round(product.rating) ? 'i-carbon:star-filled' : 'i-carbon:star'
                  "
                />
              </div>
              <span class="text-[10px] sm:text-xs text-gray-400">({{ product.reviewCount }})</span>
            </div>
          </div>
        </div>

        <!-- Add to Bag Button -->
        <button
          class="w-full py-2 border border-gray-900 dark:border-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          @click.stop="addToCart"
        >
          Add to bag
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{
  product: Product
}>()

const isFavorite = ref(false)

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

const addToCart = () => {
  // Implement add to cart logic
  console.log('Added to cart:', props.product?.title)
}
</script>
