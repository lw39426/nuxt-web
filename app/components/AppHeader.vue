<template>
  <header class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur border-b border-gray-100">
    <div class="section-container mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="text-2xl font-bold font-sans tracking-tighter"> E-COM. </NuxtLink>

      <!-- Nav Items -->
      <nav class="hidden md:flex gap-8 text-sm font-medium text-gray-600">
        <a href="#" class="hover:text-primary transition">Shop</a>
        <a href="#" class="hover:text-primary transition">New Arrivals</a>
        <a href="#" class="hover:text-primary transition">Brands</a>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <button class="p-2 hover:bg-gray-100 rounded-full">
          <div class="i-carbon-search text-xl" />
        </button>
        <button class="p-2 hover:bg-gray-100 rounded-full relative">
          <div class="i-carbon-shopping-cart text-xl" />
          <span
            class="absolute top-1 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
            >2</span
          >
        </button>
      </div>
    </div>
  </header>
</template>
