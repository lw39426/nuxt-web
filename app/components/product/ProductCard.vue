<template>
  <div class="group relative flex flex-col h-full">
    <!-- Image Container -->
    <div
      class="relative w-full h-[160px] sm:h-[256px] aspect-[4/5] overflow-hidden bg-surface-muted rounded-xl"
    >
      <NuxtLink :to="productDetailPath" class="block w-full h-full mx-auto">
        <UiImage
          :src="product?.main_image"
          :alt="product?.name || ''"
          :fallback="'/images/pro_loading.svg'"
          :dark-fallback="'/images/pro_loading_dark.svg'"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-contain p-8 sm:p-8"
        />
      </NuxtLink>

      <!-- Floating Actions -->
      <div
        class="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
      >
        <!-- Favorite Button -->
        <button
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface dark:bg-white/20 shadow-md flex items-center justify-center text-fg-muted dark:text-fg hover:text-red-500 hover:bg-elevated transition-colors disabled:opacity-60"
          :disabled="favoritePending"
          @click.stop="toggleFavorite"
        >
          <div
            :class="[
              isFavorite ? 'i-carbon-favorite-filled text-red-500' : 'i-carbon-favorite',
              'text-base sm:text-xl'
            ]"
          />
        </button>

        <!-- Compare Button：加入 / 移出对比栏 -->
        <button
          v-if="!inCompare || !isComparePage"
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface dark:bg-white/20 shadow-md flex items-center justify-center transition-colors disabled:opacity-60"
          :class="
            inCompare
              ? 'text-accent'
              : 'text-fg-muted dark:text-fg hover:text-accent hover:bg-elevated'
          "
          :aria-label="inCompare ? '移出对比' : '加入对比'"
          @click.stop="toggleCompare"
        >
          <div
            :class="['i-carbon-compare', 'text-base sm:text-xl', inCompare ? 'text-accent' : '']"
          />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="pt-3 flex flex-col flex-1">
      <div class="mb-1 sm:mb-2 flex items-center gap-2 flex-wrap">
        <span class="text-[10px] sm:text-xs font-medium text-fg-subtle uppercase tracking-wider">{{
          product.brand || 'Brand'
        }}</span>
        <span
          v-for="tag in product.tags || []"
          :key="tag.id"
          class="text-[10px] px-1.5 py-0.5 rounded text-white"
          :style="{ backgroundColor: tag.color || '#3b82f6' }"
        >
          {{ tag.name }}
        </span>
      </div>
      <NuxtLink :to="productDetailPath" class="block mb-1 sm:mb-2">
        <h3
          class="text-sm sm:text-base font-medium text-fg group-hover:text-fg-muted line-clamp-2 transition-colors"
        >
          {{ product?.name }}
        </h3>
      </NuxtLink>

      <!-- 角色一句话简介 -->
      <p
        v-if="product.description"
        class="mb-1 sm:mb-2 text-xs sm:text-sm text-fg-muted line-clamp-2"
      >
        {{ product.description }}
      </p>

      <div class="mt-auto">
        <!-- 角色信息：类型 / 年代 / 人气评分 -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span
              v-if="product.character_type"
              class="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-accent/15 text-fg-subtle font-medium"
            >
              {{ product.character_type }}
            </span>
            <span v-if="product.era" class="text-[10px] sm:text-xs text-fg-subtle">
              {{ product.era }}
            </span>
          </div>
          <span
            v-if="product.ratings?.popularity"
            class="text-[10px] sm:text-xs text-fg-muted flex items-center gap-0.5"
          >
            <div class="i-carbon-star-filled text-amber-400" />
            {{ product.ratings.popularity }}
          </span>
        </div>

        <!-- 查看详情入口 -->
        <NuxtLink
          :to="productDetailPath"
          class="block w-full py-2 border border-fg rounded-lg text-xs sm:text-sm font-medium hover:bg-fg hover:text-canvas transition-colors text-center"
        >
          查看图鉴
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';
import { useAuthStore } from '~/stores/auth';
import { useUiStore } from '~/stores/ui';
import { useFavoriteStore } from '~/stores/favorite';
import { useCompareStore } from '~/stores/compare';

const props = defineProps<{
  product: Product;
}>();

const authStore = useAuthStore();
const uiStore = useUiStore();
// 收藏态统一走全局缓存 store：N 张卡片共享 1 次全量拉取，卡片自身 0 查询请求
const favoriteStore = useFavoriteStore();
const compareStore = useCompareStore();
const favoritePending = ref(false);
// useToast 属客户端能力：SSR 的 setup 阶段调用会使 vite-node worker 直接崩溃
// （曾导致全站 500），沿用项目既有写法仅在客户端实例化
const toast = import.meta.client ? useToast() : null;
// 对比页自身卡片不再显示对比按钮（页面内已有移除按钮）
const route = useRoute();
const isComparePage = computed(() => route.path === '/compare');

/** 收藏态：从全局缓存 Set 读取（内存匹配，0 网络请求），跨页自动同步 */
const isFavorite = computed(() => favoriteStore.has('product', props.product.id));

/** 是否已在对比栏 */
const inCompare = computed(() => compareStore.has(props.product.id));

/** 加入 / 移出对比栏；已满 4 个时 toast 提示 */
const toggleCompare = () => {
  const result = compareStore.toggle({ id: props.product.id, name: props.product.name || '' });
  if (result === 'rejected') {
    toast?.add({
      id: 'compare-full',
      title: '最多对比 4 个角色',
      description: '请先移除对比栏中的角色',
      color: 'warning'
    });
  }
};

const productDetailPath = computed(() => `/products/${props.product.code || props.product.id}`);

/** 预热收藏缓存：并发去重（N 张卡片共享 1 个 Promise），命中缓存则 0 请求 */
onMounted(() => {
  favoriteStore.ensureLoaded().catch(() => {
    // 加载失败静默降级为"未收藏"展示，不阻塞商品卡片渲染；下次进入自动重试
  });
});

/** 收藏 / 取消收藏：未登录唤起登录弹窗；乐观更新与失败回滚均在 store 内完成 */
const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    uiStore.openAuthModal('login');
    return;
  }
  if (favoritePending.value) return;
  favoritePending.value = true;
  try {
    // store 内部：先改本地 Set（UI 立即反馈）→ 请求 → 成功按后端回正 / 失败回滚
    await favoriteStore.toggle('product', props.product.id);
  } catch {
    // 失败提示由 useApi 全局 toast 兜底，本地状态已在 store 内回滚
  } finally {
    favoritePending.value = false;
  }
};
</script>
