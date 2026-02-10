<script setup lang="ts">
const props = defineProps<{
  brands: { name: string; count: number }[]
  memoryOptions: { name: string; count: number }[]
}>()

const priceRange = defineModel<number[]>('priceRange', { required: true })
const selectedBrands = defineModel<string[]>('selectedBrands', { required: true })
const selectedMemory = defineModel<string[]>('selectedMemory', { required: true })
const brandSearch = defineModel<string>('brandSearch', { default: '' })
const memorySearch = defineModel<string>('memorySearch', { default: '' })

const filteredBrands = computed(() => {
  return props.brands.filter((b) => b.name.toLowerCase().includes(brandSearch.value.toLowerCase()))
})

const filteredMemory = computed(() => {
  return props.memoryOptions.filter((m) =>
    m.name.toLowerCase().includes(memorySearch.value.toLowerCase())
  )
})
</script>

<template>
  <div class="space-y-10">
    <!-- Price -->
    <div>
      <h3 class="font-bold text-gray-900 dark:text-white mb-6">价格范围</h3>
      <div class="space-y-6">
        <USlider v-model="priceRange[0]" :min="0" :max="2000" size="sm" color="neutral" tooltip />
        <div class="flex items-center gap-4">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
            <input
              v-model="priceRange[0]"
              type="number"
              class="w-full pl-6 pr-2 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>
          <span class="text-gray-300">-</span>
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
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
      <div class="space-y-3 max-h-50 overflow-y-auto custom-scrollbar pr-2">
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
</template>

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
