<script setup lang="ts">
defineProps<{ images: string[] }>()
const activeImageIndex = ref(0)
</script>

<template>
  <div class="flex flex-col-reverse md:flex-row gap-4">
    <!-- Thumbnails (Left or Bottom) -->
    <div class="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible hide-scrollbar">
      <button
        v-for="(img, idx) in images"
        :key="idx"
        class="w-20 h-20 border-2 rounded-lg overflow-hidden flex-shrink-0 transition"
        :class="
          activeImageIndex === idx ? 'border-primary' : 'border-transparent hover:border-gray-200'
        "
        @click="activeImageIndex = idx"
      >
        <img
          :src="img"
          class="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
        />
      </button>
    </div>

    <!-- Main Image -->
    <div
      class="flex-1 bg-gray-50 rounded-xl overflow-hidden relative group aspect-square md:aspect-auto"
    >
      <img
        :src="images[activeImageIndex]"
        class="w-full h-full object-cover object-center transition duration-500 group-hover:scale-105"
        alt="Product Image"
        loading="eager"
        decoding="async"
        fetchpriority="high"
      />
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
