<script setup lang="ts">
import type { Article, BlogPost } from '~/types/blog';
import { formatDate } from '~/utils/format';

interface Props {
  articles?: Article[];
}

const props = withDefaults(defineProps<Props>(), {
  articles: () => []
});

const displayArticles = computed(() => props.articles.slice(0, 6));

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
    tags: [],
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
    tags: [],
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
    tags: [],
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
    tags: [],
    published_date: '2026-07-12T16:00:00Z'
  },
  {
    id: 5,
    code: 'art_005',
    title: '折叠屏走向成熟：这一年值得换机吗',
    description: '从铰链、屏幕到软件适配，盘点折叠屏的进步与仍存在的短板',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    category_name: '选购指南',
    author: '硬件实验室',
    views: 1988,
    tags: [],
    published_date: '2026-07-08T11:20:00Z'
  }
];

const finalArticles = computed(() => {
  return displayArticles.value.length > 0 ? displayArticles.value : fallbackArticles;
});

/** 轮播取前 3 篇，其余以后以索引列表展示 */
const carouselPosts = computed<BlogPost[]>(() =>
  finalArticles.value.slice(0, 3).map((article: any) => ({
    id: article.id,
    code: article.code || String(article.id),
    title: article.title,
    excerpt: article.description,
    category: article.category_name,
    image: article.image,
    date: formatDate(article.published_date),
    author: {
      name: article.author || article.user?.nickname || '佚名',
      role: '',
      avatar: article.user?.avatar || ''
    }
  }))
);

/** 标签配色与文章详情页底部保持一致：文字实色 + 33% 描边 + 8% 底色 */
const tagStyle = (color?: string) => {
  const resolved = color || '#6B7280';
  return {
    color: resolved,
    borderColor: `${resolved}55`,
    backgroundColor: `${resolved}14`
  };
};
</script>

<template>
  <section class="py-14 md:py-16 bg-canvas content-visibility-auto">
    <div class="section-container">
      <!-- 标题区：移动端把「查看全部」浮到眉题右侧，桌面端保持原布局 -->
      <UiSectionHeader
        class="relative mb-6 max-md:[&>div:last-child]:absolute max-md:[&>div:last-child]:right-0 max-md:[&>div:last-child]:top-0 md:mb-14"
        tone="muted"
        label="资讯中心"
        title="最新资讯"
        description="掌握科技前沿动态，获取专业选购建议"
      >
        <template #actions>
          <NuxtLink
            to="/blog"
            class="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-fg transition-opacity hover:opacity-60 max-md:h-8"
          >
            查看全部
            <div class="i-carbon-arrow-right" />
          </NuxtLink>
        </template>
      </UiSectionHeader>

      <!-- 左右布局：左侧 Hero 轮播 + 右侧索引列表 -->
      <div class="grid lg:grid-cols-2 gap-5">
        <!-- 左侧：尺寸由本页控制（与右列同高），字号用 compact 半栏排版 -->
        <BlogHeroCarousel
          :posts="carouselPosts"
          size="compact"
          class="aspect-[4/3] md:aspect-[16/11] rounded-3xl"
        />

        <!-- 右侧：轮播之外的资讯。移动端为细分隔线索引，桌面端为独立卡片 -->
        <div class="flex flex-col gap-0 md:gap-5">
          <template v-for="(article, idx) in finalArticles.slice(3)" :key="article.id">
            <div v-if="idx > 0" class="h-px bg-line/70 md:hidden" aria-hidden="true" />
            <NuxtLink
              :to="`/blog/${article.code || article.id}`"
              class="group grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3.5 py-4 active:opacity-70 md:flex md:flex-1 md:gap-5 md:rounded-2xl md:bg-surface-muted md:p-4 md:transition-colors md:duration-300 md:hover:bg-elevated md:active:opacity-100"
            >
              <!-- 缩略图 -->
              <div
                class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted md:h-22 md:w-30"
              >
                <UiImage
                  :src="article.image"
                  :alt="article.title"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <!-- 内容：移动端标题与描述在前，标签与元信息收到底部 -->
              <div class="flex min-w-0 flex-col py-0.5 md:flex-1 md:justify-between">
                <div>
                  <h3
                    class="mb-1.5 text-[15px] font-semibold leading-snug text-fg transition-opacity group-hover:opacity-70 line-clamp-2 md:text-[15px]"
                  >
                    {{ article.title }}
                  </h3>
                  <p
                    class="text-xs leading-[1.6] text-fg-subtle line-clamp-2 md:leading-4 md:block"
                  >
                    {{ article.description }}
                  </p>
                </div>

                <!-- 桌面端：标签与元信息置于卡片底部 -->
                <div
                  class="mt-2 hidden items-center justify-between gap-3 text-[11px] text-fg-subtle md:mt-0 md:flex"
                >
                  <div
                    v-if="article.tags?.length"
                    class="flex min-w-0 flex-wrap items-center gap-1.5"
                  >
                    <div class="i-carbon-tag h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                    <span
                      v-for="tag in article.tags"
                      :key="tag.id"
                      class="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                      :style="tagStyle(tag.color)"
                    >
                      {{ tag.name }}
                    </span>
                  </div>
                  <div class="ml-auto flex shrink-0 items-center gap-3">
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
              </div>

              <!-- 移动端底部：标签靠左，时间与浏览量靠右 -->
              <div class="col-span-2 mt-2.5 flex items-start justify-between gap-3 md:hidden">
                <div
                  v-if="article.tags?.length"
                  class="flex min-w-0 flex-wrap items-center gap-1.5"
                >
                  <div class="i-carbon-tag h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                  <span
                    v-for="tag in article.tags"
                    :key="tag.id"
                    class="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                    :style="tagStyle(tag.color)"
                  >
                    {{ tag.name }}
                  </span>
                </div>
                <div
                  class="ml-auto flex shrink-0 items-center gap-2.5 pt-0.5 text-[11px] text-fg-subtle"
                >
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
          </template>
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
