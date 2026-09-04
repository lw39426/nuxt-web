<script setup lang="ts">
import type { BlogPost } from '~/types/blog';
const props = defineProps<{
  blogPost: BlogPost;
}>();

// 作者名（可能为空）
const authorName = computed(() => props.blogPost.author?.name || '佚名');
// 头像为空时降级显示首字母
const authorAvatar = computed(() => props.blogPost.author?.avatar || '');
</script>

<template>
  <NuxtLink :to="`/blog/${blogPost.code}`" class="group flex flex-col h-full gap-4 cursor-pointer">
    <!-- Image Container 图片部分 -->
    <div class="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface">
      <UiImage
        :src="blogPost.image"
        :alt="blogPost.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>

    <!-- Content 内容部分-->
    <div class="flex flex-col flex-1 gap-3">
      <!-- Category -->
      <div class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        {{ blogPost.category }}
      </div>

      <!-- Title -->
      <h3
        class="text-xl font-bold text-fg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2"
      >
        {{ blogPost.title }}
      </h3>

      <!-- Excerpt -->
      <p class="text-sm text-fg-muted line-clamp-2">
        {{ blogPost.excerpt }}
      </p>

      <!-- Author：头像缺失或加载失败时降级显示姓名首字母 -->
      <div class="mt-auto pt-2 flex items-center gap-3">
        <UiImage
          :src="authorAvatar"
          :alt="authorName"
          class="h-8 w-8 rounded-full object-cover"
          variant="avatar"
        >
          <template #fallback>
            <div class="h-8 w-8 rounded-full bg-surface-muted flex items-center justify-center">
              <span class="text-xs font-bold text-fg-muted">
                {{ authorName.charAt(0) }}
              </span>
            </div>
          </template>
        </UiImage>
        <div class="flex flex-col">
          <span class="text-xs font-medium text-fg">{{ authorName }}</span>
          <span v-if="blogPost.author?.role" class="text-[10px] text-fg-subtle">{{
            blogPost.author.role
          }}</span>
          <span class="text-[10px] text-fg-subtle">{{ blogPost.date }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
