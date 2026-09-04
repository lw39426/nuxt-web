<script setup lang="ts">
import type { RecommendationProduct } from '~/types/search';
import { HOT_TAGS, RECOMMEND_PRODUCTS } from '~/utils/searchMock';

const emit = defineEmits<{
  /** 点击热门标签,以该标签为关键词搜索 */
  'select-tag': [tag: string];
  /** 点击推荐商品(演示) */
  'select-product': [product: RecommendationProduct];
}>();

/** 右侧推荐商品 */
const products: RecommendationProduct[] = RECOMMEND_PRODUCTS;
/** 热门标签 */
const tags: string[] = HOT_TAGS;
</script>

<template>
  <!-- 右侧推荐栏:相关推荐 + 热门标签 -->
  <aside class="space-y-5">
    <!-- 模块 1:相关推荐 -->
    <section class="bg-surface rounded-2xl p-4">
      <h2 class="text-[15px] font-semibold text-fg mb-3">🔥 相关推荐</h2>
      <div class="flex flex-col gap-3">
        <button
          v-for="item in products"
          :key="item.id"
          class="group text-left cursor-pointer"
          @click="emit('select-product', item)"
        >
          <!-- 图区:emoji 占位 -->
          <div
            class="h-[120px] flex items-center justify-center bg-surface-muted rounded-xl text-5xl select-none group-hover:opacity-90 transition-opacity"
            aria-hidden="true"
          >
            {{ item.emoji }}
          </div>
          <p
            class="mt-2 truncate text-sm font-semibold text-fg group-hover:text-brand transition-colors"
          >
            {{ item.name }}
          </p>
          <p class="mt-0.5 text-sm">
            <span class="font-bold text-fg">¥{{ item.price }}</span>
            <span v-if="item.originalPrice" class="ml-1.5 text-xs text-fg-subtle line-through">
              ¥{{ item.originalPrice }}
            </span>
          </p>
        </button>
      </div>
    </section>

    <!-- 模块 2:热门标签 -->
    <section class="bg-surface rounded-2xl p-4">
      <h2 class="text-[15px] font-semibold text-fg mb-3">🏷️ 热门标签</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in tags"
          :key="tag"
          class="px-3 py-1.5 bg-surface-muted text-fg-muted rounded-full text-xs transition-colors cursor-pointer hover:bg-brand-soft hover:text-brand"
          @click="emit('select-tag', tag)"
        >
          {{ tag }}
        </button>
      </div>
    </section>
  </aside>
</template>
