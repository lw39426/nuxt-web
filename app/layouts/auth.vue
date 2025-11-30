<template>
  <div class="min-h-screen flex font-sans">
    <!-- Left Side左侧图片 - Image -->
    <div class="hidden lg:block lg:w-3/5 relative bg-gray-900 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80"
        alt="Background"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="absolute bottom-8 left-8 text-white text-xs font-medium drop-shadow-md z-10">
        Photo by
        <a
          href="https://unsplash.com/@alexandrpopadin"
          target="_blank"
          class="hover:underline opacity-80 hover:opacity-100"
          >Alexandr Popadin</a
        >
      </div>
    </div>

    <!-- Right Side右侧内容 - Content -->
    <div class="w-full lg:w-2/5 flex flex-col bg-white dark:bg-gray-900 relative">
      <!-- Scrollable content area -->
      <div class="flex-1 flex flex-col justify-center px-8 sm:px-8 lg:px-20 xl:px-24 py-12">
        <!-- Logo Area -->
        <div class="mb-10 flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 shadow-lg"
          ></div>
          <span class="font-bold text-xl text-gray-900 dark:text-white tracking-tight"
            >UI Unicorn</span
          >
        </div>

        <slot />
      </div>

      <!-- Footer -->
      <div
        class="py-6 px-8 sm:px-8 lg:px-20 xl:px-24 flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800"
      >
        <div class="flex items-center gap-2 group cursor-pointer">
          <div
            class="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-white transition-transform group-hover:scale-110"
          >
            <div class="i-carbon-user-avatar-filled-alt text-[14px]"></div>
          </div>
          <span class="group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
            >@uiunicorn</span
          >
        </div>
        <span class="opacity-70">© Perfect Login 2021</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth Layout
</script>
