<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});
</script>

<template>
  <div class="bg-canvas min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div class="flex flex-col md:flex-row gap-6 lg:gap-8">
        <!-- 侧边栏 -->
        <aside class="w-full md:w-64 shrink-0">
          <ProfileSidebar />
        </aside>
        <!-- 右侧内容区 -->
        <main class="flex-1 min-w-0">
          <NuxtPage />
        </main>
      </div>
    </div>
  </div>
</template>
