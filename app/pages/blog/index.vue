<script setup lang="ts">
import type { BlogPost, Article, ArticleCategory } from '~/types/blog';
import { useArticleApi } from '~/composables/api/article';
import { useIntersectionObserver } from '@vueuse/core';

const { list, categories: fetchCategories } = useArticleApi();

// Hero Post 暂时使用 Mock 数据
const heroPost: BlogPost = {
  id: 1,
  code: '1',
  title: 'Introducing the Mintlify Agent to write documentation with AI',
  excerpt: 'Automatically update documentation with context from PRs, Slack threads, or links.',
  category: 'Announcements',
  image:
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
  date: 'September 29, 2025 • 2 min read',
  author: {
    name: 'Han Wang',
    role: '创始人',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
  },
  isHero: true
};

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

// --- 分类 ---
const categoryList = ref<ArticleCategory[]>([]);
const activeCategory = ref<number | null>(null); // null = 全部

// 加载分类
const loadCategories = async () => {
  try {
    const data = await fetchCategories();
    // 接口异常返回非数组时保持空列表
    categoryList.value = Array.isArray(data) ? data : [];
  } catch (err) {
    // 分类加载失败时保持默认
    console.error('Failed to load categories:', err);
  }
};

// --- 文章列表 & 分页 ---
const displayedPosts = ref<BlogPost[]>([]);
const isLoading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = 10;
const loadMoreTrigger = ref<HTMLElement | null>(null);

/** 加载文章列表 */
const loadArticles = async (reset = false) => {
  if (isLoading.value || (!hasMore.value && !reset)) return;
  isLoading.value = true;

  if (reset) {
    currentPage.value = 1;
    displayedPosts.value = [];
    hasMore.value = true;
  }

  try {
    const data = await list({
      page: currentPage.value,
      pageSize,
      category_id: activeCategory.value ?? undefined
    });

    // 接口异常返回缺失字段时做降级处理
    const articles = Array.isArray(data?.articles) ? data.articles : [];
    const newPosts = articles.map(articleToBlogPost);
    displayedPosts.value.push(...newPosts);

    if (data?.pagination) {
      const { page, pages } = data.pagination;
      hasMore.value = page < pages;
      currentPage.value++;
    } else {
      // 无分页信息时停止加载，避免死循环请求
      hasMore.value = false;
    }
  } catch (err) {
    console.error('Failed to load articles:', err);
    // 网络错误时停止加载
    hasMore.value = false;
  } finally {
    isLoading.value = false;
  }
};

// 切换分类
const selectCategory = (categoryId: number | null) => {
  activeCategory.value = categoryId;
  loadArticles(true);
};

// 监听滚动触底 - 无限加载
useIntersectionObserver(
  loadMoreTrigger,
  (entries) => {
    const entry = entries[0];
    if (entry && entry.isIntersecting) {
      loadArticles();
    }
  },
  {
    rootMargin: '0px 0px 300px 0px'
  }
);

// 初始加载
onMounted(() => {
  loadCategories();
  loadArticles();
});
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-black pb-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <!-- 头部宣传区域Hero Post -->
      <NuxtLink
        :to="`/blog/${heroPost.id}`"
        class="group relative block w-full aspect-[2/1] md:aspect-[2.5/1] rounded-3xl overflow-hidden mb-12 isolate transform-gpu"
      >
        <!-- 底层背景图 -->
        <img
          :src="heroPost.image"
          :alt="heroPost.title"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <!-- 叠加层: 背景图加载失败时的渐变背景色 -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        ></div>
        <!-- 叠加层: 文章内容 Content -->
        <div class="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-2/3">
          <div class="text-gray-300 text-sm mb-3 font-medium">{{ heroPost.date }}</div>
          <h1
            class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-blue-200 transition-colors"
          >
            {{ heroPost.title }}
          </h1>
          <p class="text-gray-300 text-lg mb-6 line-clamp-2 md:line-clamp-none">
            {{ heroPost.excerpt }}
          </p>

          <div class="flex items-center gap-3">
            <img
              :src="heroPost.author.avatar"
              :alt="heroPost.author.name"
              class="h-10 w-10 rounded-full border-2 border-white/20"
            />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-white">{{ heroPost.author.name }}</span>
              <span class="text-xs text-gray-400">{{ heroPost.author.role }}</span>
            </div>
          </div>
        </div>
        <!-- 叠加层:边框效果Border Overlay for Anti-aliasing -->
        <div
          class="absolute inset-0 rounded-3xl ring-1 ring-inset ring-transparent dark:ring-[#686868] pointer-events-none z-10"
        ></div>
      </NuxtLink>

      <!-- 筛选器: 分类标签Filter Tabs -->
      <div
        class="flex flex-wrap items-center justify-center gap-2 mb-12 overflow-x-auto pb-2 scrollbar-hide"
      >
        <button
          class="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
          :class="[
            activeCategory === null
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20'
          ]"
          @click="selectCategory(null)"
        >
          全部文章
        </button>
        <button
          v-for="cat in categoryList"
          :key="cat.id"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
          :class="[
            activeCategory === cat.id
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20'
          ]"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
        <!-- RSS 订阅按钮，未来可设置为用户订阅、加载更多 -->
        <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <div class="i-carbon-rss w-5 h-5"></div>
        </button>
      </div>

      <!-- 空数据状态 -->
      <div v-if="!isLoading && displayedPosts.length === 0" class="text-center py-20 text-gray-400">
        <div class="text-5xl mb-4">📭</div>
        <p class="text-sm">暂无文章，换个分类试试吧</p>
      </div>

      <!-- 文章内容布局Blog Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 mb-20">
        <BlogCard v-for="blogPost in displayedPosts" :key="blogPost.id" :blog-post="blogPost" />
      </div>

      <!-- 加载更多触发器 / 底部状态 -->
      <div ref="loadMoreTrigger" class="flex justify-center mt-12 py-8">
        <div v-if="isLoading" class="flex items-center gap-2 text-gray-500">
          <div class="i-carbon-circle-dash w-6 h-6 animate-spin"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="!hasMore" class="text-gray-400 text-sm">- 到底了，没有更多内容了 -</div>
        <!-- 这里的空 div 用于 IntersectionObserver 监听 -->
        <div v-else class="h-4 w-full"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
