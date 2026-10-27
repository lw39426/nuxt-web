<script setup lang="ts">
import type { Article, BlogPost } from '~/types/blog';
import { useArticleApi } from '~/composables/api/article';

const route = useRoute();
/** 文章标识（code 或 id），随路由变化响应式更新 */
const articleCode = computed(() => String(route.params.id ?? '').trim());

const { detail, related } = useArticleApi();

/**
 * 文章详情（SSR 预取）
 * - 使用 useAsyncData 而非 onMounted：保证首屏 HTML 即包含正文与 meta/JSON-LD，
 *   否则搜索引擎抓取时只能看到空壳页面，SEO 形同虚设
 * - 接口异常时 detail 抛出会被捕获到 error，页面展示「文章不存在」兜底
 */
const {
  data: articleData,
  pending: articlePending,
  error: articleError
} = await useAsyncData(
  () => `blog-detail-${articleCode.value}`,
  () => detail(articleCode.value),
  { watch: [articleCode], default: () => null }
);

/** 文章详情数据（null 表示加载失败或不存在） */
const post = computed<Article | null>(() => articleData.value ?? null);
const isLoading = computed(() => articlePending.value);
const error = computed(() => !!articleError.value);

// --- 相关文章（同样 SSR 预取，失败时静默降级为空列表） ---
const { data: relatedData } = await useAsyncData(
  () => `blog-related-${articleCode.value}`,
  async () => {
    try {
      const data = await related(articleCode.value, 4);
      // 接口异常返回非数组时保持空列表
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to load related articles:', err);
      return [];
    }
  },
  { watch: [articleCode], default: () => [] }
);

const relatedPosts = computed<BlogPost[]>(() => (relatedData.value ?? []).map(articleToBlogPost));

/** 安全格式化日期（无效/缺失时返回空串） */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/** 将 Article 转为 BlogPost 供 BlogCard 使用（带字段判空保护） */
function articleToBlogPost(article: Article): BlogPost {
  return {
    id: article.id,
    code: article.code || String(article.id),
    title: article.title || '无标题',
    excerpt: article.description || '',
    category: article.category_name || '',
    image: article.image || '/images/placeholder.svg',
    date: formatDate(article.published_date),
    author: {
      // 优先取作者名字符串，其次取发布者昵称，最后佚名
      name: article.author || article.user?.nickname || '佚名',
      role: '',
      avatar: article.user?.avatar || ''
    }
  };
}

// 计算属性: 发布日期格式化（日期无效时返回空串）
const formattedDate = computed(() => {
  if (!post.value?.published_date) return '';
  const d = new Date(post.value.published_date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// 计算属性: 作者名（优先作者名字符串，其次发布者昵称，最后佚名）
const authorName = computed(() => post.value?.author || post.value?.user?.nickname || '佚名');

// 计算属性: 作者头像（可能为空，为空时模板降级显示首字母）
const authorAvatar = computed(() => post.value?.user?.avatar || '');

// 计算属性: 评论总数（详情接口的 comment_statistics 优先，其次 comment_count）
const totalComments = computed(
  () => post.value?.comment_statistics?.total_comments ?? post.value?.comment_count ?? 0
);

// 计算属性: 阅读时长估算
const readTime = computed(() => {
  if (!post.value?.content) return '';
  const text = post.value.content.replace(/<[^>]*>/g, '');
  const minutes = Math.max(1, Math.ceil(text.length / 500));
  return `${minutes} min read`;
});

// ==================== SEO：动态 meta ====================
// 站点正式域名（用于生成 JSON-LD 中的绝对 URL）
const siteUrl = String(useRuntimeConfig().public.siteUrl || '').replace(/\/$/, '');

/** 当前页面绝对地址（canonical 由 nuxt-seo-utils 自动生成，此处供 JSON-LD 使用） */
const pageUrl = computed(() => `${siteUrl}/blog/${articleCode.value}`);

/**
 * 文章详情页动态 meta
 * - 全部使用 getter：数据本身来自 SSR 预取，避免出现无标题页面
 * - description 优先取文章摘要，缺失时回退到通用描述
 */
useSeoMeta({
  title: () => (post.value?.title ? post.value.title : '文章详情'),
  description: () =>
    post.value?.description || (post.value?.title ? `${post.value.title} - YouMi 角色资讯` : ''),
  ogTitle: () => (post.value?.title ? `${post.value.title} - YouMi 角色百科` : 'YouMi 角色百科'),
  ogDescription: () => post.value?.description || '',
  ogType: 'article',
  ogImage: () => post.value?.image || '/favicon.svg',
  ogUrl: () => pageUrl.value,
  articlePublishedTime: () => post.value?.published_date || undefined,
  articleModifiedTime: () => post.value?.update_date || undefined
});

/**
 * 文章详情页结构化数据（JSON-LD）
 * - 使用 Article 描述，包含标题、封面、作者与发布时间，提升搜索结果展现
 * - 仅在拿到文章数据后输出，避免无效空结构化数据
 */
useHead(() => ({
  script: post.value
    ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.value.title,
            description: post.value.description || '',
            image: post.value.image || undefined,
            url: pageUrl.value,
            ...(post.value.published_date ? { datePublished: post.value.published_date } : {}),
            ...(post.value.update_date ? { dateModified: post.value.update_date } : {}),
            author: {
              '@type': 'Person',
              name: post.value.author || post.value.user?.nickname || '佚名'
            },
            publisher: {
              '@type': 'Organization',
              name: 'YouMi 角色百科'
            }
          })
        }
      ]
    : []
}));
</script>

<template>
  <div class="min-h-screen bg-canvas pb-20">
    <!-- Back Button -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <NuxtLink to="/blog" class="inline-flex items-center gap-2 group">
        <div
          class="w-8 h-8 rounded-full bg-fg text-canvas flex items-center justify-center transition-transform group-hover:-translate-x-1"
        >
          <div class="i-carbon-arrow-left w-5 h-5" />
        </div>
        <span class="font-medium text-fg">所有故事</span>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-32">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-fg-subtle"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !post" class="text-center py-32">
      <div class="text-6xl flex items-center justify-center gap-2 mb-4">
        <div class="i-carbon-blog w-12 h-12"></div>
      </div>
      <h2 class="text-xl font-bold text-fg mb-2">文章不存在</h2>
      <p class="text-fg-muted mb-6">该文章可能已被删除或链接无效</p>
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-2 px-4 py-2 bg-fg text-canvas rounded-full text-sm font-medium"
      >
        返回博客列表
      </NuxtLink>
    </div>

    <!-- Article Content -->
    <template v-else>
      <!-- Article Header -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-12 text-center">
        <h1 class="text-3xl md:text-5xl font-bold text-fg mb-8 leading-tight">
          {{ post.title }}
        </h1>
        <div
          class="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6"
        >
          <span class="uppercase tracking-wider">{{ post.category_name }}</span>
          <span class="text-fg-subtle">•</span>
          <span class="text-fg-muted">{{ formattedDate }}</span>
          <span class="text-fg-subtle">•</span>
          <span class="text-fg-muted">{{ readTime }}</span>
        </div>
        <div class="flex items-center justify-center gap-3 mb-12">
          <!-- 头像缺失或加载失败时降级显示姓名首字母 -->
          <UiImage
            :src="authorAvatar"
            :alt="authorName"
            class="h-12 w-12 rounded-full object-cover"
            variant="avatar"
          >
            <template #fallback>
              <div class="h-12 w-12 rounded-full bg-surface-muted flex items-center justify-center">
                <span class="text-lg font-bold text-fg-muted">
                  {{ authorName.charAt(0) }}
                </span>
              </div>
            </template>
          </UiImage>
          <div class="text-left">
            <div class="font-bold text-fg">{{ authorName }}</div>
            <div class="text-sm text-fg-muted">
              浏览 {{ post.views ?? 0 }} · 赞 {{ post.likes ?? 0 }} · 评论 {{ totalComments }}
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <article class="prose prose-lg dark:prose-invert max-w-none text-fg-muted">
          <div v-html="post.content"></div>
        </article>

        <!-- 标签：点击跳转列表页并按该标签筛选 -->
        <div v-if="post.tags?.length" class="mt-10 flex flex-wrap items-center gap-2">
          <div class="i-carbon-tag w-4 h-4 text-fg-subtle"></div>
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag.id"
            :to="{ path: '/blog', query: { tag: tag.name } }"
            class="px-3 py-1 rounded-full text-xs font-medium border transition-opacity hover:opacity-80"
            :style="{
              color: tag.color || '#6B7280',
              borderColor: `${tag.color || '#6B7280'}55`,
              backgroundColor: `${tag.color || '#6B7280'}14`
            }"
          >
            {{ tag.name }}
          </NuxtLink>
        </div>

        <!-- Share / Tags -->
        <div class="mt-12 pt-8 border-t border-line flex justify-between items-center">
          <div class="text-sm text-fg-muted">分享这篇文章</div>
          <div class="flex gap-4">
            <button class="p-2 rounded-full bg-surface-muted hover:bg-elevated transition-colors">
              <div class="i-carbon-logo-twitter w-5 h-5"></div>
            </button>
            <button class="p-2 rounded-full bg-surface-muted hover:bg-elevated transition-colors">
              <div class="i-carbon-logo-linkedin w-5 h-5"></div>
            </button>
            <button class="p-2 rounded-full bg-surface-muted hover:bg-elevated transition-colors">
              <div class="i-carbon-link w-5 h-5"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Related Posts -->
      <div v-if="relatedPosts.length" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <h2 class="text-2xl font-bold text-fg mb-8">推荐阅读</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <BlogCard v-for="rp in relatedPosts" :key="rp.id" :blog-post="rp" />
        </div>
      </div>
    </template>
  </div>
</template>
