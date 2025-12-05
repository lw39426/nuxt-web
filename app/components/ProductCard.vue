<template>
  <div
    class="group relative flex flex-col shadow-xl dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-800"
  >
    <!-- Image Container -->
    <div
      class="relative w-full h-[256px] aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-800/50"
    >
      <NuxtLink :to="`/products/${product.id}`" class="block mx-auto">
        <img
          :src="product.images[0]"
          :alt="product?.title"
          class="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110"
        />
      </NuxtLink>

      <!-- Floating Actions -->
      <div
        class="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
      >
        <button
          class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
          @click.stop="toggleFavorite"
        >
          <div
            :class="[
              isFavorite ? 'i-carbon-favorite-filled text-red-500' : 'i-carbon-favorite',
              'text-xl'
            ]"
          />
        </button>
        <button
          class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          @click.stop="addToCart"
        >
          <div class="i-carbon-shopping-cart text-xl" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1">
      <div class="mb-2">
        <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">{{
          product.brand || 'Brand'
        }}</span>
      </div>
      <NuxtLink :to="`/products/${product.id}`" class="block mb-2">
        <h3
          class="text-base font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors"
        >
          {{ product?.title }}
        </h3>
      </NuxtLink>

      <div class="mt-auto flex items-end justify-between">
        <div class="flex flex-col">
          <span class="text-lg font-bold text-gray-900 dark:text-white">${{ product.price }}</span>
          <div class="flex items-center gap-1 mt-1">
            <div class="flex text-yellow-400 text-xs">
              <div
                v-for="i in 5"
                :key="i"
                :class="i <= Math.round(product.rating) ? 'i-carbon-star-filled' : 'i-carbon-star'"
              />
            </div>
            <span class="text-xs text-gray-400">({{ product.reviewCount }})</span>
          </div>
        </div>
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
