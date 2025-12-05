<template>
  <div class="bg-white dark:bg-black min-h-screen">
    <!-- Sticky Header for Product (optional, maybe just breadcrumbs) -->

    <div v-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Breadcrumbs -->
      <nav class="flex text-sm text-gray-500 mb-12">
        <ol class="flex items-center space-x-2">
          <li>
            <NuxtLink to="/" class="hover:text-gray-900 dark:hover:text-white transition-colors"
              >Home</NuxtLink
            >
          </li>
          <li><span class="mx-2 text-gray-300">/</span></li>
          <li>
            <NuxtLink
              to="/products"
              class="hover:text-gray-900 dark:hover:text-white transition-colors"
              >Catalog</NuxtLink
            >
          </li>
          <li><span class="mx-2 text-gray-300">/</span></li>
          <li>
            <NuxtLink
              to="/products"
              class="hover:text-gray-900 dark:hover:text-white transition-colors"
              >Smartphones</NuxtLink
            >
          </li>
          <li><span class="mx-2 text-gray-300">/</span></li>
          <li class="text-gray-900 dark:text-white font-medium truncate max-w-xs">
            {{ product?.title }}
          </li>
        </ol>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <!-- Gallery (Left, larger) -->
        <div class="lg:col-span-7 space-y-6">
          <div
            class="aspect-[4/3] bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center relative group"
          >
            <img
              :src="activeImage"
              class="w-full h-full object-contain p-12 transition-transform duration-500 group-hover:scale-105"
            />
            <button
              class="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur hover:bg-white dark:hover:bg-black transition-colors"
            >
              <div class="i-carbon-maximize text-xl" />
            </button>
          </div>
          <div class="flex gap-4 overflow-x-auto pb-2">
            <button
              v-for="img in product?.images"
              :key="img"
              class="w-24 h-24 flex-shrink-0 rounded-xl border-2 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-all"
              :class="
                activeImage === img
                  ? 'border-black dark:border-white'
                  : 'border-transparent hover:border-gray-200'
              "
              @click="activeImage = img"
            >
              <img :src="img" class="w-full h-full object-contain p-2" />
            </button>
          </div>
        </div>

        <!-- Info (Right, Sticky) -->
        <div class="lg:col-span-5">
          <div class="sticky top-24 space-y-8">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                {{ product?.title }}
              </h1>
              <div class="flex items-center gap-4">
                <div class="flex text-yellow-400 text-sm">
                  <div
                    v-for="i in 5"
                    :key="i"
                    :class="
                      i <= Math.round(product?.rating || 0)
                        ? 'i-carbon-star-filled'
                        : 'i-carbon-star'
                    "
                  />
                </div>
                <span class="text-sm text-gray-500">{{ product?.reviewCount }} reviews</span>
              </div>
            </div>

            <div class="text-4xl font-bold text-gray-900 dark:text-white">
              ${{ product?.price }}
            </div>

            <div class="h-px bg-gray-100 dark:bg-gray-800" />

            <!-- Options -->
            <div class="space-y-6">
              <!-- Color -->
              <div v-if="product?.colors?.length">
                <label class="text-sm font-medium text-gray-900 dark:text-white block mb-3"
                  >Color</label
                >
                <div class="flex gap-3">
                  <button
                    v-for="color in product.colors"
                    :key="color.name"
                    class="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black transition-all"
                    :class="
                      selectedColor === color.name
                        ? 'ring-black dark:ring-white scale-110'
                        : 'ring-transparent hover:scale-110'
                    "
                    :style="{ backgroundColor: color.hex }"
                    :title="color.name"
                    @click="selectedColor = color.name"
                  />
                </div>
              </div>
              <!-- Memory -->
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white block mb-3"
                  >Storage</label
                >
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="mem in ['128GB', '256GB', '512GB', '1TB']"
                    :key="mem"
                    class="py-3 rounded-lg border text-sm font-medium transition-all"
                    :class="
                      selectedMemory === mem
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:text-gray-400'
                    "
                    @click="selectedMemory = mem"
                  >
                    {{ mem }}
                  </button>
                </div>
              </div>
            </div>

            <div class="flex gap-4 pt-6">
              <button
                class="flex-1 bg-black dark:bg-white text-white dark:text-black h-14 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
              >
                Add to Cart
              </button>
              <button
                class="w-14 h-14 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-black dark:hover:border-white transition-colors"
              >
                <div class="i-carbon-favorite text-xl" />
              </button>
            </div>

            <!-- Accordion for details instead of tabs -->
            <div class="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
              <UAccordion
                :items="[
                  { label: 'Icons', icon: 'i-lucide-smile', slot: 'desc' },
                  { label: 'Colors', icon: 'i-lucide-swatch-book', slot: 'specs' },
                  { label: 'Components', icon: 'i-lucide-box', slot: 'reviews' }
                ]"
                :ui="{
                  item: 'py-4 border-b border-gray-100 dark:border-gray-800'
                }"
              >
                <template #desc>
                  <div
                    class="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 py-4"
                  >
                    <p>{{ product?.description }}</p>
                  </div>
                </template>
                <template #specs>
                  <dl class="grid grid-cols-1 gap-y-4 py-4">
                    <div class="flex justify-between">
                      <dt class="text-gray-500">Screen Size</dt>
                      <dd class="font-medium text-gray-900 dark:text-white">6.7"</dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-500">CPU</dt>
                      <dd class="font-medium text-gray-900 dark:text-white">Apple A16 Bionic</dd>
                    </div>
                  </dl>
                </template>
                <template #reviews>
                  <div class="space-y-6 py-4">
                    <div v-for="i in 2" :key="i" class="flex gap-4">
                      <div
                        class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500"
                      >
                        U
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-bold text-gray-900 dark:text-white">User {{ i }}</span>
                          <div class="flex text-yellow-400 text-xs">
                            <div v-for="s in 5" :key="s" class="i-carbon-star-filled" />
                          </div>
                        </div>
                        <p class="text-gray-600 dark:text-gray-300 text-sm">Great product!</p>
                      </div>
                    </div>
                  </div>
                </template>
              </UAccordion>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="mt-32 border-t border-gray-100 dark:border-gray-800 pt-20">
        <div class="flex items-center justify-between mb-12">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">You might also like</h2>
          <NuxtLink to="/products" class="text-sm font-medium hover:underline">View all</NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProductCard v-for="related in relatedProducts" :key="related.id" :product="related" />
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center min-h-[50vh]">
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">Product not found</h1>
        <NuxtLink to="/products">
          <UButton color="neutral">Back to Catalog</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'

const route = useRoute()
const { getProductById, products } = useProducts()

const product = computed(() => getProductById(Number(route.params.id)))
const activeImage = ref('')
const selectedColor = ref('')
const selectedMemory = ref('128GB')

// Initialize defaults when product loads
watchEffect(() => {
  if (product.value) {
    activeImage.value = product.value.images[0] || ''
    if (product.value.colors && product.value.colors.length > 0) {
      selectedColor.value = product.value.colors[0]?.name || ''
    }
    if (product.value.memory) {
      selectedMemory.value = product.value.memory
    }
  }
})

const relatedProducts = computed(() =>
  products.value.filter((p) => p.id !== product.value?.id).slice(0, 4)
)
</script>
