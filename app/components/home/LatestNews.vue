<script setup lang="ts">
import type { Article } from '~/types/blog';

interface Props {
  articles?: Article[];
}

const props = withDefaults(defineProps<Props>(), {
  articles: () => []
});

const displayArticles = computed(() => props.articles.slice(0, 4));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = MONTHS[date.getMonth()];
  const d = date.getDate();
  return `${y} ${m} ${d}`;
};

const fallbackArticles = [
  {
    id: 1,
    code: 'art_001',
    title: '2026年科技趋势：AI如何重塑消费电子',
    description: '深度解析人工智能在消费电子领域的最新应用与发展方向',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    category_name: '行业洞察',
    author: '科技前沿',
    views: 2340,
    published_date: '2026-07-20T10:00:00Z'
  },
  {
    id: 2,
    code: 'art_002',
    title: '选购指南：如何挑选适合自己的智能手表',
    description: '从功能、续航到生态，全面解析智能手表选购要点',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    category_name: '选购指南',
    author: '产品评测',
    views: 1856,
    published_date: '2026-07-18T14:30:00Z'
  },
  {
    id: 3,
    code: 'art_003',
    title: 'M3芯片 MacBook Pro 深度体验报告',
    description: '三个月深度使用，从开发到设计，全面评估新MacBook Pro表现',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    category_name: '产品评测',
    author: '硬件实验室',
    views: 3201,
    published_date: '2026-07-15T09:00:00Z'
  },
  {
    id: 4,
    code: 'art_004',
    title: '无线耳机音质进化论：从入门到发烧',
    description: '蓝牙编解码技术解析，帮你找到音质与便携的最佳平衡点',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category_name: '技术科普',
    author: '音频研究所',
    views: 1567,
    published_date: '2026-07-12T16:00:00Z'
  }
];

const finalArticles = computed(() => {
  return displayArticles.value.length > 0 ? displayArticles.value : fallbackArticles;
});
</script>

<template>
  <section class="py-24 md:py-32 bg-white dark:bg-black content-visibility-auto">
    <div class="section-container">
      <!-- 标题区 -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
        <div class="max-w-xl">
          <p
            class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4"
          >
            资讯中心
          </p>
          <h2
            class="text-4xl md:text-6xl font-semibold text-gray-900 dark:text-white mb-5 tracking-tight"
          >
            最新资讯
          </h2>
          <p class="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            掌握科技前沿动态，获取专业选购建议
          </p>
        </div>
        <NuxtLink
          to="/blog"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white hover:opacity-60 transition-opacity shrink-0"
        >
          查看全部
          <div class="i-carbon-arrow-right" />
        </NuxtLink>
      </div>

      <!-- 左右布局：左大卡片 + 右3小卡片 -->
      <div class="grid lg:grid-cols-2 gap-5">
        <!-- 左侧：大卡片 -->
        <NuxtLink
          :to="`/blog/${finalArticles[0]?.code || finalArticles[0]?.id}`"
          class="group relative rounded-3xl overflow-hidden bg-[#f5f5f7] dark:bg-[#1d1d1f] block"
        >
          <div class="relative h-full min-h-[420px] md:min-h-[500px]">
            <img
              :src="finalArticles[0]?.image"
              :alt="finalArticles[0]?.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            />

            <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span
                class="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-white/15 text-white/90 backdrop-blur-sm mb-4"
              >
                {{ finalArticles[0]?.category_name || '资讯' }}
              </span>
              <h3
                class="text-xl md:text-2xl font-semibold text-white mb-3 group-hover:opacity-80 transition-opacity line-clamp-2"
              >
                {{ finalArticles[0]?.title }}
              </h3>
              <p class="text-sm text-white/60 mb-4 line-clamp-2">
                {{ finalArticles[0]?.description }}
              </p>
              <div class="flex items-center gap-4 text-xs text-white/40">
                <span class="flex items-center gap-1">
                  <div class="i-carbon-calendar" />
                  {{ formatDate(finalArticles[0]?.published_date || '') }}
                </span>
                <span class="flex items-center gap-1">
                  <div class="i-carbon-view" />
                  {{ finalArticles[0]?.views || 0 }}
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- 右侧：3个小卡片（上下排列） -->
        <div class="flex flex-col gap-5">
          <NuxtLink
            v-for="article in finalArticles.slice(1)"
            :key="article.id"
            :to="`/blog/${article.code || article.id}`"
            class="group flex gap-5 p-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f] transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-[#2d2d2f] flex-1"
          >
            <!-- 缩略图 -->
            <div class="shrink-0 w-32 h-28 md:w-40 md:h-32 rounded-xl overflow-hidden">
              <img
                :src="article.image"
                :alt="article.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <!-- 内容 -->
            <div class="flex flex-col justify-between min-w-0 flex-1 py-0.5">
              <div>
                <span
                  class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 mb-2"
                >
                  {{ article.category_name || '资讯' }}
                </span>
                <h3
                  class="text-sm md:text-[15px] font-semibold text-gray-900 dark:text-white group-hover:opacity-70 transition-opacity line-clamp-2 mb-1.5"
                >
                  {{ article.title }}
                </h3>
                <p class="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 hidden md:block">
                  {{ article.description }}
                </p>
              </div>
              <div class="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                <span class="flex items-center gap-1">
                  <div class="i-carbon-calendar" />
                  {{ formatDate(article.published_date) }}
                </span>
                <span class="flex items-center gap-1">
                  <div class="i-carbon-view" />
                  {{ article.views || 0 }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 1000px;
}
</style>
