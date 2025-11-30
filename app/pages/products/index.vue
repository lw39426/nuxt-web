<template>
  <div class="bg-white dark:bg-black min-h-screen pb-20">
    <!-- Header Section -->
    <div
      class="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-30"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <UBreadcrumb :links="links" :ui="{ ol: 'gap-x-2', li: 'text-sm' }" />

        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500 hidden sm:block">
            {{ products.length }} Products
          </span>
          <div class="h-4 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />
          <USelectMenu
            v-model="sortBy"
            :options="['Newest', 'Price: Low to High', 'Price: High to Low', 'Rating']"
            variant="none"
            placeholder="Sort by"
            class="w-40"
          />
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Sidebar Filters -->
        <div class="w-full lg:w-64 flex-shrink-0 space-y-10">
          <!-- Price -->
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-6">Price Range</h3>
            <div class="space-y-6">
              <USlider v-model="priceRange[0]" :min="0" :max="2000" size="sm" color="black" />
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
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">Brands</h3>
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
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">Memory</h3>
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

          <div class="pt-6 border-t border-gray-100 dark:border-gray-800">
            <UAccordion
              :items="accordionItems"
              variant="ghost"
              :ui="{ item: { padding: 'py-3' }, button: { padding: 'py-3' } }"
            >
              <template #protection>
                <div class="space-y-2 pt-2">
                  <div
                    v-for="opt in protectionOptions"
                    :key="opt.name"
                    class="flex items-center justify-between"
                  >
                    <UCheckbox v-model="selectedProtection" :value="opt.name" :label="opt.name" />
                    <span class="text-xs text-gray-500">{{ opt.count }}</span>
                  </div>
                </div>
              </template>
              <template #diagonal>
                <div class="space-y-2 pt-2">
                  <div
                    v-for="opt in screenDiagonalOptions"
                    :key="opt.name"
                    class="flex items-center justify-between"
                  >
                    <UCheckbox
                      v-model="selectedScreenDiagonal"
                      :value="opt.name"
                      :label="opt.name"
                    />
                    <span class="text-xs text-gray-500">{{ opt.count }}</span>
                  </div>
                </div>
              </template>
              <template #screen>
                <div class="space-y-2 pt-2">
                  <div
                    v-for="opt in screenTypeOptions"
                    :key="opt.name"
                    class="flex items-center justify-between"
                  >
                    <UCheckbox v-model="selectedScreenType" :value="opt.name" :label="opt.name" />
                    <span class="text-xs text-gray-500">{{ opt.count }}</span>
                  </div>
                </div>
              </template>
              <template #battery>
                <div class="space-y-2 pt-2">
                  <div
                    v-for="opt in batteryOptions"
                    :key="opt.name"
                    class="flex items-center justify-between"
                  >
                    <UCheckbox v-model="selectedBattery" :value="opt.name" :label="opt.name" />
                    <span class="text-xs text-gray-500">{{ opt.count }}</span>
                  </div>
                </div>
              </template>
            </UAccordion>
          </div>
        </div>

        <!-- Grid -->
        <div class="flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
          </div>

          <div class="mt-16 flex justify-center">
            <UPagination v-model="page" :page-count="5" :total="products.length" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'

const { products } = useProducts()
const page = ref(1)
const sortBy = ref('Rating')
const priceRange = ref([0, 2000])
const brandSearch = ref('')
const memorySearch = ref('')
const selectedBrands = ref(['Apple'])
const selectedMemory = ref([])

const links = [
  { label: 'Home', to: '/' },
  { label: 'Catalog', to: '/products' },
  { label: 'Smartphones' }
]

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

const protectionOptions = [
  { name: 'IP67', count: 12 },
  { name: 'IP68', count: 45 },
  { name: 'None', count: 10 }
]
const screenDiagonalOptions = [
  { name: '6.1"', count: 20 },
  { name: '6.7"', count: 15 },
  { name: '5.4"', count: 5 }
]
const screenTypeOptions = [
  { name: 'OLED', count: 50 },
  { name: 'LCD', count: 10 }
]
const batteryOptions = [
  { name: '3000-4000mAh', count: 25 },
  { name: '4000-5000mAh', count: 30 },
  { name: '>5000mAh', count: 15 }
]

const selectedProtection = ref([])
const selectedScreenDiagonal = ref([])
const selectedScreenType = ref([])
const selectedBattery = ref([])

const accordionItems = [
  { label: 'Protection class', slot: 'protection' },
  { label: 'Screen diagonal', slot: 'diagonal' },
  { label: 'Screen type', slot: 'screen' },
  { label: 'Battery capacity', slot: 'battery' }
]
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
</style>
