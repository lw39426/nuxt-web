<script setup lang="ts">
import type { ArticleResult } from '~/types/search';
import { formatCompact } from '~/utils/searchMock';

interface Props {
  /** 文章结果数据 */
  article: ArticleResult;
}

defineProps<Props>();

const emit = defineEmits<{
  /** 点击查看详情 */
  detail: [id: string];
}>();
</script>

<template>
  <!-- 文章结果卡片:纯文字密度型 -->
  <article
    class="p-4 bg-surface border border-transparent rounded-2xl hover:border-brand hover:shadow-md transition-all duration-200 cursor-pointer"
    @click="emit('detail', article.id)"
  >
    <!-- 类型标签行 -->
    <div class="flex items-center gap-2">
      <span class="px-2 py-0.5 bg-brand-soft text-brand rounded-md text-xs font-medium">文章</span>
      <span class="text-xs text-fg-subtle">{{ article.category }}</span>
    </div>

    <!-- 标题 -->
    <h3 class="mt-1.5 text-[17px] font-semibold text-fg">
      {{ article.title }}
    </h3>

    <!-- 摘要 -->
    <p class="mt-1 line-clamp-2 text-sm text-fg-muted">
      {{ article.summary }}
    </p>

    <!-- 底部行:作者信息 + 标签云 -->
    <div class="mt-2.5 flex items-center justify-between gap-4">
      <div class="flex items-center gap-2.5 text-[13px] text-fg-muted min-w-0">
        <!-- 28px 圆形首字头像 -->
        <span
          class="shrink-0 w-7 h-7 flex items-center justify-center bg-brand text-on-brand rounded-full text-xs font-semibold select-none"
          aria-hidden="true"
        >
          {{ article.author.avatar }}
        </span>
        <span class="text-fg shrink-0">{{ article.author.name }}</span>
        <span class="shrink-0">{{ article.publishDate }}</span>
        <span class="truncate"
          >{{ formatCompact(article.readCount) }} 阅读 · {{ article.likeCount }} 赞</span
        >
      </div>
      <div class="shrink-0 flex items-center gap-1.5">
        <span
          v-for="tag in article.tags"
          :key="tag"
          class="px-2.5 py-1 bg-surface-muted rounded-md text-xs text-fg-muted"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>
