<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{ product: Product }>()

const selectedSize = ref(props.product.sizes[0])
const selectedColor = ref(props.product.colors[0])
const quantity = ref(1)

const addToCart = () => {
  alert(`Added: ${props.product.title} | Size: ${selectedSize.value} | Qty: ${quantity.value}`)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div>
      <div class="flex justify-between items-start">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900">{{ product.title }}</h1>
        <div class="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-md">
          <div class="i-carbon-star-filled" />
          <span class="text-sm font-semibold text-gray-700">{{ product.rating }}</span>
        </div>
      </div>
      <p class="text-gray-500 mt-2 text-sm">600+ people bought this recently</p>
    </div>

    <!-- Price -->
    <div class="flex items-end gap-3">
      <span class="text-3xl font-bold">${{ product.price }}</span>
      <span v-if="product.originalPrice" class="text-xl text-gray-400 line-through mb-1">
        ${{ product.originalPrice }}
      </span>
      <span class="text-sm text-red-600 bg-red-50 px-2 py-1 rounded mb-1"> -20% </span>
    </div>

    <div class="h-px bg-gray-200 my-2" />

    <!-- Color Selection -->
    <div>
      <span class="text-sm font-medium text-gray-900">Select Color</span>
      <div class="flex gap-3 mt-3">
        <button
          v-for="color in product.colors"
          :key="color.name"
          class="w-8 h-8 rounded-full ring-2 ring-offset-2 transition"
          :class="selectedColor?.name === color.name ? 'ring-primary' : 'ring-transparent'"
          :style="{ backgroundColor: color.hex }"
          :title="color.name"
          @click="selectedColor = color"
        />
      </div>
    </div>

    <!-- Size Selection -->
    <div>
      <div class="flex justify-between">
        <span class="text-sm font-medium text-gray-900">Choose Size</span>
        <button class="text-sm text-gray-500 underline hover:text-primary">Size Guide</button>
      </div>
      <div class="grid grid-cols-4 gap-2 mt-3">
        <button
          v-for="size in product.sizes"
          :key="size"
          class="py-3 text-sm font-medium border rounded-lg transition hover:border-gray-400"
          :class="selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-200'"
          @click="selectedSize = size"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <div class="h-px bg-gray-200 my-2" />

    <!-- Actions -->
    <div class="flex gap-4">
      <div class="flex items-center border border-gray-300 rounded-full h-12 px-4 gap-4">
        <button class="text-xl hover:text-primary" @click="quantity > 1 && quantity--">-</button>
        <span class="w-4 text-center font-medium">{{ quantity }}</span>
        <button class="text-xl hover:text-primary" @click="quantity++">+</button>
      </div>

      <button
        class="flex-1 bg-black text-white font-medium rounded-full h-12 hover:bg-gray-800 transition flex items-center justify-center gap-2 active:scale-95"
        @click="addToCart"
      >
        <div class="i-carbon-shopping-bag" />
        Add to Cart
      </button>
    </div>

    <!-- Description -->
    <div class="prose text-gray-500 text-sm leading-relaxed mt-4">
      <p>{{ product.description }}</p>
    </div>
  </div>
</template>
