<script setup lang="ts">
import type { Product } from '~/types/product';
import ProductCard from '~/components/product/ProductCard.vue';

interface Props {
  /** 精选角色列表（首页聚合接口 featured.products） */
  characters?: Product[];
  /** 精选栏目标签名 */
  featuredTagName?: string;
}

const _props = withDefaults(defineProps<Props>(), {
  characters: () => [],
  featuredTagName: '精选角色'
});

// 卡片墙容器引用：GSAP 滚动触发动画的目标
const wallRef = ref<HTMLElement | null>(null);

/**
 * 首屏滚动入场动画：
 * - ScrollTrigger 触发后逐卡 stagger 上浮淡入
 * - 尊重用户减少动效偏好（prefers-reduced-motion）时跳过动画
 */
onMounted(() => {
  const { $gsap } = useNuxtApp();
  if (!$gsap || !wallRef.value) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = wallRef.value.querySelectorAll('.character-card-item');

  $gsap.from(cards, {
    y: 60,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
    scrollTrigger: {
      trigger: wallRef.value,
      start: 'top 85%',
      once: true
    }
  });
});
</script>

<template>
  <section
    class="relative py-24 md:py-32 bg-canvas-elevated overflow-hidden content-visibility-auto"
  >
    <!-- 背景装饰渐变 -->
    <div
      class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-soft rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"
    />
    <div
      class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 pointer-events-none"
    />

    <div class="section-container relative z-10">
      <!-- 标题区 -->
      <UiSectionHeader
        class="mb-6"
        tone="accent"
        label="角色百科"
        title="精选角色卡片墙"
        description="每一个角色，都值得被认真看见——探索你喜爱的每一个世界"
      >
        <template #actions>
          <span
            class="px-5 py-2.5 rounded-full text-xs font-bold bg-surface text-fg-muted border-line border"
          >
            {{ featuredTagName }}
          </span>
        </template>
      </UiSectionHeader>

      <!-- 角色卡片墙 -->
      <div
        v-if="characters.length > 0"
        ref="wallRef"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
      >
        <div v-for="character in characters" :key="character.id" class="character-card-item">
          <ProductCard :product="character" />
        </div>
      </div>

      <!-- 骨架屏 -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        <div v-for="i in 8" :key="i" class="bg-surface rounded-2xl p-4">
          <div class="aspect-[4/5] bg-elevated rounded-xl mb-4 animate-pulse" />
          <div class="h-4 bg-elevated rounded mb-2 animate-pulse w-3/4" />
          <div class="h-3 bg-elevated rounded mb-4 animate-pulse w-1/2" />
          <div class="h-8 bg-elevated rounded animate-pulse w-full" />
        </div>
      </div>

      <!-- 查看更多 -->
      <div class="text-center mt-14">
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 px-8 py-3 bg-surface border border-line rounded-full text-sm font-medium text-fg hover:bg-surface-muted transition-all duration-300"
        >
          探索全部角色
          <div class="i-carbon-arrow-right" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 1200px;
}
</style>
