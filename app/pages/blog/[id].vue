<script setup lang="ts">
import type { Article, BlogPost } from '~/types/blog';
import { useArticleApi } from '~/composables/api/article';

const route = useRoute();
const articleCode = route.params.id as string;
if (import.meta.dev) {
  console.log('Article code from route:', articleCode);
}

const { detail, related } = useArticleApi();

// --- 文章详情 ---
const post = ref<Article | null>(null);
const isLoading = ref(true);
const error = ref(false);

// --- 相关文章 ---
const relatedPosts = ref<BlogPost[]>([]);

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

/** 加载文章详情 */
const loadArticle = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await detail(articleCode);
    if (import.meta.dev) {
      console.log('Loaded article data:', data);
    }
    post.value = data;
  } catch (err) {
    console.error('Failed to load article:', err);
    error.value = true;
  } finally {
    isLoading.value = false;
  }
};

/** 加载相关文章 */
const loadRelated = async () => {
  try {
    const data = await related(articleCode, 4);
    // 接口异常返回非数组时保持空列表
    relatedPosts.value = Array.isArray(data) ? data.map(articleToBlogPost) : [];
  } catch (err) {
    console.error('Failed to load related articles:', err);
    // 相关文章加载失败不影响主内容
  }
};

// 初始加载
onMounted(async () => {
  await loadArticle();
  if (post.value) {
    loadRelated();
  }
});

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

      <!-- Featured Image -->
      <div v-if="post.image" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div class="aspect-[2/1] rounded-3xl overflow-hidden shadow-2xl">
          <UiImage :src="post.image" :alt="post.title" class="w-full h-full object-cover" />
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <article class="prose prose-lg dark:prose-invert max-w-none text-fg-muted">
          <div v-html="post.content"></div>
        </article>

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
