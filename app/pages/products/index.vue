<template>
  <div class="bg-white dark:bg-black min-h-screen pb-20">
    <!-- Store Header Section头部分类列表 -->
    <!-- 
      Implemented based on Apple Store design
      Features: Gradient title, category navigation, responsive layout
    -->
    <div class="bg-gray-50 dark:bg-neutral-900 pt-16 pb-8 mb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Title and Subtitle Area 标题副标题区域 -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
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
              class="flex flex-col items-center min-w-[80px] cursor-pointer group/item space-y-3"
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

    <!-- Header Section内容区域 -->
    <div
      class="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-30 pt-16"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <UBreadcrumb
          :items="links"
          :ui="{
            list: 'gap-x-2',
            link: 'text-sm'
          }"
        />

        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500 hidden sm:block"> {{ total }} Products </span>
          <div class="h-4 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />
          <USelect
            v-model="sortBy"
            :items="['最新', '价格: 低到高', '价格: 高到低', '评分']"
            class="w-48 p-2"
          />
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Sidebar Filters侧边栏筛选器 -->
        <div class="w-full lg:w-64 flex-shrink-0 space-y-10">
          <!-- Price -->
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-6">价格范围</h3>
            <div class="space-y-6">
              <USlider
                v-model="priceRange[0]"
                :min="0"
                :max="2000"
                size="sm"
                color="neutral"
                tooltip
              />
              <div class="flex items-center gap-4">
                <div class="relative flex-1">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                    >$</span
                  >
                  <input
                    v-model="priceRange[0]"
                    type="number"
                    class="w-full pl-6 pr-2 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
                <span class="text-gray-300">-</span>
                <div class="relative flex-1">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                    >$</span
                  >
                  <input
                    v-model="priceRange[1]"
                    type="number"
                    class="w-full pl-6 pr-2 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Brands -->
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">品牌</h3>
            <div class="relative mb-4">
              <div class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="brandSearch"
                type="text"
                placeholder="Search"
                class="w-full pl-9 pr-3 py-2 bg-transparent border-b border-gray-200 dark:border-gray-800 text-sm focus:border-black dark:focus:border-white transition-colors outline-none"
              />
            </div>
            <div class="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              <label
                v-for="brand in filteredBrands"
                :key="brand.name"
                class="flex items-center justify-between cursor-pointer group"
              >
                <div class="flex items-center gap-3">
                  <div class="relative flex items-center">
                    <input
                      v-model="selectedBrands"
                      type="checkbox"
                      :value="brand.name"
                      class="peer sr-only"
                    />
                    <div
                      class="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded transition-colors peer-checked:bg-black peer-checked:border-black dark:peer-checked:bg-white dark:peer-checked:border-white"
                    ></div>
                    <div
                      class="absolute inset-0 flex items-center justify-center text-white dark:text-black opacity-0 peer-checked:opacity-100 pointer-events-none"
                    >
                      <div class="i-carbon-checkmark text-xs" />
                    </div>
                  </div>
                  <span
                    class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                    >{{ brand.name }}</span
                  >
                </div>
                <span class="text-xs text-gray-400">{{ brand.count }}</span>
              </label>
            </div>
          </div>

          <!-- Memory -->
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">内存</h3>
            <div class="space-y-3">
              <label
                v-for="mem in filteredMemory"
                :key="mem.name"
                class="flex items-center justify-between cursor-pointer group"
              >
                <div class="flex items-center gap-3">
                  <div class="relative flex items-center">
                    <input
                      v-model="selectedMemory"
                      type="checkbox"
                      :value="mem.name"
                      class="peer sr-only"
                    />
                    <div
                      class="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded transition-colors peer-checked:bg-black peer-checked:border-black dark:peer-checked:bg-white dark:peer-checked:border-white"
                    ></div>
                    <div
                      class="absolute inset-0 flex items-center justify-center text-white dark:text-black opacity-0 peer-checked:opacity-100 pointer-events-none"
                    >
                      <div class="i-carbon-checkmark text-xs" />
                    </div>
                  </div>
                  <span
                    class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                    >{{ mem.name }}</span
                  >
                </div>
                <span class="text-xs text-gray-400">{{ mem.count }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Grid 商品网格布局 -->
        <div class="flex-1">
          <div
            v-if="products.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12"
          >
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="flex flex-col h-full items-center justify-center py-20 text-gray-500 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800"
          >
            <div class="i-carbon-search text-6xl mb-4 text-gray-300 dark:text-gray-600"></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">未找到相关商品</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
              尝试调整筛选条件或清除所有筛选
            </p>
            <button
              class="px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              @click="resetFilters"
            >
              清除筛选条件
            </button>
          </div>

          <div v-if="products.length > 0" class="mt-16 flex justify-center">
            <UPagination
              v-model:page="page"
              active-color="neutral"
              :items-per-page="pageSize"
              :total="total"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductApi } from '~/composables/api/product'
import type { Product } from '~/types/product'

/**
 * Product categories for the store header navigation
 * Implements the category list shown in the design mockups
 * Uses official Apple Store assets for visual fidelity
 */
const categories = [
  {
    name: 'Mac',
    image:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-mac-nav-202510?wid=400&hei=260&fmt=png-alpha&.v=M1Q3OGxnb1lBaHhqNjZ2OVRXZmx4YkVwOVNLbHRldEZZYkpvZ0VDM1ZJYisrUlZaSVRoWVYzU0Qra0FoTmUwNng2bitObzZwQzk4cEorV1dZdzhIazlhTkRKemhDN0NEc1VzN1ZjMGR5dUk'
  },
  {
    name: 'iPhone',
    image:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-iphone-nav-202509?wid=1200&hei=780&fmt=png-alpha&.v=dW5XbHI1eDVpd01qWUU4bFRtWGZXM1doT212VzJoWjBSKzRpbmNETHN1QnRHU3BERzdnOWdiQkwvWTZGajY2b1M0TjRWdzF2UjRGVEY0c3dBQVZ6VFN0TmdKaCs3NTJMbFVuOGp2LzI5RGc'
  },
  {
    name: 'iPad',
    image:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-ipad-nav-202405?wid=400&hei=260&fmt=png-alpha&.v=dW5XbHI1eDVpd01qWUU4bFRtWGZXNGFLQTJVNnlNQmQrVmRBYnZYei9jckUzelNmMnRxajE0NHhmMWtLazl6eG53M0FRZHBXNTh1U1lFVEtSR2YzTm5qbE56RWRpRFNIRXZvbkd2S0l5dTg'
  },
  {
    name: 'Apple Watch',
    image:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-watch-nav-202509_GEO_CN?wid=400&hei=260&fmt=png-alpha&.v=S0tSVzBtSkRkSFFhMm1zS1NmeWtkK0gvNGFhODF5SWpidW9tVnFmL2Irb2VvdFg5cVlhUGU4K01Fajc1NW0yZ2M5THdmR1U4Nmp4b2NFbEg2N21UQzYzZVFZZGtHNUI4c1NvME1xTTYxSzc5a0ZJUzF4N0hxOTgyVVJQTk50c2M'
  },
  {
    name: 'Apple Vision Pro',
    image:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-vision-pro-nav-202401?wid=400&hei=260&fmt=png-alpha&.v=VzVpanYvTldHb05iVXFhc0xveWRLM25jd0w4dXFwc1hFbWZkNm9IcUR2bytSMWt1ZUNyTGx4SjRKL1pSL0ZDeGpCeVFkSWhuN0RJazJDeHBqaFFac0hlZzcwajlwb1R2dHNlazl1dldSUGQ5RzBLTDk5c25YRG5wR2ZpUlI4RFM'
  },
  {
    name: 'AirPods',
    image:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-airpods-nav-202509?wid=400&hei=260&fmt=png-alpha&.v=Q0Z1bWFqMUpRRnp3T0Y0VWJpdk1yMDhFUStvWHB3SDlDa3VrdUZORWRqeld1aTN5QlRYNG5PRjJxc2d1RklXbVM0TjRWdzF2UjRGVEY0c3dBQVZ6VGZUMjJQZFhhT2thWmkxZjhra3FyZEk'
  },
  {
    name: 'HomePod',
    image:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-homepod-nav-202301?wid=400&hei=260&fmt=png-alpha&.v=WVcvamRucHVMMWs5SXZ3bVJ3Q2hpZGR0czFXNWdCUW14eTN2U29pLzNMcld1aTN5QlRYNG5PRjJxc2d1RklXbVM0TjRWdzF2UjRGVEY0c3dBQVZ6VFJmbWU0TjJLamxsdTltNkZVZ1RhbDA'
  }
]

const { search } = useProductApi()
const products = ref<Product[]>([])
const total = ref(0)
const pageSize = ref(9)
const page = ref(1)
const sortBy = ref('最新')
const priceRange = ref([0, 5000])
const brandSearch = ref('')
const memorySearch = ref('')
const selectedBrands = ref<string[]>([])
const selectedMemory = ref<string[]>([])
const selectedCategory = ref<string | null>(null)

const mapSort = (label: string) => {
  switch (label) {
    case '最新':
      return 'latest'
    case '价格: 低到高':
      return 'price_asc'
    case '价格: 高到低':
      return 'price_desc'
    case '评分':
      return 'popular'
    default:
      return 'latest'
  }
}

const { data, refresh } = await useAsyncData('products-search', () =>
  search({
    page: page.value,
    pageSize: pageSize.value,
    minPrice: priceRange.value[0],
    maxPrice: priceRange.value[1],
    sort: mapSort(sortBy.value),
    brand: selectedBrands.value,
    memory: selectedMemory.value
  })
)

watch(
  [page, sortBy, priceRange, selectedBrands, selectedMemory],
  (new1, old) => {
    console.log('发生变化', new1, old)
    refresh()
  },
  { deep: true }
)

watchEffect(() => {
  if (data.value?.data) {
    console.log('Data updated:', data.value.data.items.length, 'items')
    products.value = data.value.data.items
    total.value = data.value.data.total
  }
})

const links = computed(() => {
  const base = [
    { label: '首页', to: '/', icon: 'i-carbon:home' },
    { label: '分类', to: '/products', icon: 'i-carbon:grid' }
  ]
  if (selectedCategory.value) {
    base.push({ label: selectedCategory.value, icon: 'i-carbon:tag', to: '' })
  }
  return base
})

const brands = [
  { name: 'Apple', count: 110 },
  { name: 'Samsung', count: 125 },
  { name: 'Xiaomi', count: 68 },
  { name: 'Poco', count: 44 },
  { name: 'OPPO', count: 36 },
  { name: 'Honor', count: 10 },
  { name: 'Motorola', count: 34 },
  { name: 'Nokia', count: 22 },
  { name: 'Realme', count: 35 }
]

const memoryOptions = [
  { name: '16GB', count: 65 },
  { name: '32GB', count: 123 },
  { name: '64GB', count: 48 },
  { name: '128GB', count: 90 },
  { name: '256GB', count: 24 },
  { name: '512GB', count: 8 }
]

const filteredBrands = computed(() => {
  return brands.filter((b) => b.name.toLowerCase().includes(brandSearch.value.toLowerCase()))
})

const filteredMemory = computed(() => {
  return memoryOptions.filter((m) =>
    m.name.toLowerCase().includes(memorySearch.value.toLowerCase())
  )
})

const resetFilters = () => {
  brandSearch.value = ''
  memorySearch.value = ''
  selectedBrands.value = []
  selectedMemory.value = []
  priceRange.value = [0, 2000]
  sortBy.value = '最新'
  page.value = 1
}
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
