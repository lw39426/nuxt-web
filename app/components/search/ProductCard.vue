<script setup lang="ts">
import type { ProductResult } from '~/types/search';
import { formatCount } from '~/utils/searchMock';

interface Props {
  /** 商品结果数据 */
  product: ProductResult;
}

defineProps<Props>();

const emit = defineEmits<{
  /** 点击收藏 */
  favorite: [id: string];
  /** 点击查看详情 */
  detail: [id: string];
}>();

/** 收藏态(本地演示,不持久化) */
const isFavorited = shallowRef(false);
</script>

<template>
  <!-- 商品结果卡片:左 emoji 占位块 + 右内容区 -->
  <article
    class="flex gap-4 p-4 bg-surface border border-transparent rounded-2xl hover:border-brand hover:shadow-md transition-all duration-200 cursor-pointer"
    @click="emit('detail', product.id)"
  >
    <!-- 左:120x120 emoji 占位块 -->
    <div
      class="shrink-0 w-[120px] h-[120px] flex items-center justify-center bg-surface-muted rounded-xl text-5xl select-none"
      aria-hidden="true"
    >
      {{ product.emoji }}
    </div>

    <!-- 右:内容区 -->
    <div class="flex-1 min-w-0 flex flex-col">
      <!-- 类型标签行 -->
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 bg-brand-soft text-brand rounded-md text-xs font-medium"
          >产品</span
        >
        <span class="text-xs text-fg-subtle">{{ product.category }}</span>
      </div>

      <!-- 商品名 + 价格区 -->
      <div class="mt-1.5 flex items-start justify-between gap-4">
        <h3 class="text-base font-semibold text-fg truncate">
          {{ product.name }}
        </h3>
        <div class="shrink-0 text-right">
          <p class="text-xl font-bold text-fg">¥{{ product.price }}</p>
          <p v-if="product.originalPrice" class="text-xs text-fg-subtle line-through">
            ¥{{ product.originalPrice }}
          </p>
        </div>
      </div>

      <!-- 描述 -->
      <p class="mt-1 line-clamp-2 text-sm text-fg-muted">
        {{ product.description }}
      </p>

      <!-- 底部行:评分/销量/店铺 + 收藏与详情按钮 -->
      <div class="mt-auto pt-2 flex items-end justify-between gap-4">
        <div class="flex items-center gap-3 text-[13px] text-fg-muted">
          <span class="flex items-center gap-1">
            <span class="text-yellow-400" aria-hidden="true">⭐</span>{{ product.rating }}
          </span>
          <span>月销 {{ formatCount(product.sales) }}</span>
          <span class="truncate">{{ product.shop }}</span>
        </div>
        <div class="shrink-0 flex items-center gap-2">
          <button
            class="w-9 h-9 flex items-center justify-center border border-line rounded-xl transition-colors cursor-pointer hover:border-brand"
            :class="isFavorited ? 'text-brand border-brand' : 'text-fg-muted'"
            :aria-label="isFavorited ? '取消收藏' : '收藏'"
            :aria-pressed="isFavorited"
            @click.stop="
              isFavorited = !isFavorited;
              emit('favorite', product.id);
            "
          >
            <span
              class="w-4.5 h-4.5"
              :class="isFavorited ? 'i-lucide-heart-fill' : 'i-lucide-heart'"
            />
          </button>
          <button
            class="h-9 px-5 bg-fg text-canvas rounded-xl text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            @click.stop="emit('detail', product.id)"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
