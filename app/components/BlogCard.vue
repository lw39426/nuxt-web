<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

defineProps<{
  post: BlogPost
}>()
</script>

<template>
  <NuxtLink :to="`/blog/${post.id}`" class="group flex flex-col gap-4 cursor-pointer">
    <!-- Image Container -->
    <div
      class="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800"
    >
      <img
        :src="post.image"
        :alt="post.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-3">
      <!-- Category -->
      <div class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        {{ post.category }}
      </div>

      <!-- Title -->
      <h3
        class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2"
      >
        {{ post.title }}
      </h3>

      <!-- Excerpt -->
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {{ post.excerpt }}
      </p>

      <!-- Author -->
      <div class="mt-2 flex items-center gap-3">
        <img
          :src="post.author.avatar"
          :alt="post.author.name"
          class="h-8 w-8 rounded-full object-cover"
        />
        <div class="flex flex-col">
          <span class="text-xs font-medium text-gray-900 dark:text-white">{{
            post.author.name
          }}</span>
          <span class="text-[10px] text-gray-500 dark:text-gray-400">{{ post.author.role }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
