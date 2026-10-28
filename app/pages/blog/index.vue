<script setup lang="ts">
import type { BlogPost, Article, ArticleCategory, ArticleTag } from '~/types/blog';
import type { Banner } from '~/composables/api/home';
import { useArticleApi } from '~/composables/api/article';
import { useHomeApi } from '~/composables/api/home';
import { useIntersectionObserver } from '@vueuse/core';

const {
  list,
  categories: fetchCategories,
  tags: fetchTags,
  search: searchArticles
} = useArticleApi();
const { getBanners } = useHomeApi();

/**
 * 博客列表页 SEO 元信息
 * - 覆盖全站默认 title/description，突出「角色资讯 / 博客」关键词
 * - canonical / og:url 由 nuxt-seo-utils 依据 site.url 自动生成
 */
useSeoMeta({
  title: '角色资讯',
  description:
    'YouMi 角色资讯频道，分享动漫与影视角色的深度解读、人物关系梳理、作品盘点与粉丝话题，带你更全面地了解每个角色。'
});

/** 当前路由：用于读取详情页标签 / 关键词跳转带入的 query */
const route = useRoute();

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

// --- 标签 ---
const tagList = ref<ArticleTag[]>([]);
const activeTag = ref<string | null>(null); // null = 全部标签

// --- 搜索 ---
const keyword = ref('');
/** 已提交生效的关键词（区别于输入框实时值，避免每次按键都请求） */
const activeKeyword = ref('');

// 支持从详情页标签跳转带入 ?tag=xxx 与 ?keyword=xxx；放在 setup 顶层，SSR 首屏同样生效
const qTag = route.query.tag;
if (typeof qTag === 'string' && qTag) activeTag.value = qTag;
const qKeyword = route.query.keyword;
if (typeof qKeyword === 'string' && qKeyword) {
  keyword.value = qKeyword;
  activeKeyword.value = qKeyword;
}

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

// 加载标签
const loadTags = async () => {
  try {
    const data = await fetchTags(2); // 2 = 文章标签
    tagList.value = Array.isArray(data) ? data : [];
  } catch (err) {
    // 标签加载失败时不展示标签行
    console.error('Failed to load tags:', err);
  }
};

// --- 文章列表 & 分页 ---
const displayedPosts = ref<BlogPost[]>([]);
const isLoading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = 10;
const loadMoreTrigger = ref<HTMLElement | null>(null);

/** 是否已完成首次列表请求（含失败）：用于区分“尚未加载”与“确实没有文章” */
const hasLoadedOnce = ref(false);

/** 空数据状态：首次请求结束、非加载中且无文章 */
const isEmpty = computed(
  () => hasLoadedOnce.value && !isLoading.value && displayedPosts.value.length === 0
);

/** 首屏骨架：首次请求结束前一直展示，避免 SSR 直出“暂无文章”再跳成列表 */
const showInitialSkeleton = computed(
  () => !hasLoadedOnce.value && displayedPosts.value.length === 0
);

/** Hero 轮播数据：banner 接口原始响应，字段不做裁剪，组件直接消费 */
const heroPosts = ref<Banner[]>([]);

/** 加载 Hero 轮播数据：走 banner 接口（blog_top_banner 位，web 端），失败静默由占位兜底 */
const loadHeroPosts = async () => {
  try {
    const data = await getBanners({ placement_key: 'blog_top_banner', client_type: 'web' });
    heroPosts.value = Array.isArray(data?.banners) ? data.banners : [];
  } catch (err) {
    console.error('Failed to load hero banners:', err);
  }
};

/**
 * 首屏数据 SSR 预取：banner、分类、标签、文章列表并发请求，
 * 让 HTML 直接带内容，避免「先进占位、再等接口二次填充」。
 * 非关键请求失败降级为空；文章列表失败整体返回 null，交给客户端重试。
 */
const { data: initialData } = await useAsyncData('blog-index', async () => {
  const firstPageParams = {
    page: 1,
    pageSize,
    tag: activeTag.value ?? undefined
  };

  const [banners, categories, tags, articles] = await Promise.all([
    getBanners({ placement_key: 'blog_top_banner', client_type: 'web' }).catch((err) => {
      console.error('Failed to load hero banners:', err);
      return null;
    }),
    fetchCategories().catch((err) => {
      console.error('Failed to load categories:', err);
      return [];
    }),
    fetchTags(2).catch((err) => {
      console.error('Failed to load tags:', err);
      return [];
    }),
    (activeKeyword.value
      ? searchArticles({ ...firstPageParams, keyword: activeKeyword.value })
      : list(firstPageParams)
    ).catch((err) => {
      console.error('Failed to load articles:', err);
      return null;
    })
  ] as const);

  if (!articles) return null;
  return { banners, categories, tags, articles };
});

// 用预取结果初始化状态；hydration 时从 payload 复用，两端渲染一致
const initial = initialData.value;
categoryList.value = Array.isArray(initial?.categories) ? initial.categories : [];
tagList.value = Array.isArray(initial?.tags) ? initial.tags : [];
heroPosts.value = Array.isArray(initial?.banners?.banners) ? initial.banners.banners : [];

if (initial?.articles) {
  const articles = Array.isArray(initial.articles.articles) ? initial.articles.articles : [];
  displayedPosts.value = articles.map(articleToBlogPost);
  hasLoadedOnce.value = true;

  const pagination = initial.articles.pagination;
  if (pagination) {
    hasMore.value = pagination.page < pagination.pages;
    currentPage.value = pagination.page + 1;
  } else {
    hasMore.value = false;
  }
}

/** 加载文章列表（reset=true 时回到第一页；有关键词时走搜索接口） */
const loadArticles = async (reset = false) => {
  if (isLoading.value || (!hasMore.value && !reset)) return;
  isLoading.value = true;

  if (reset) {
    currentPage.value = 1;
    // 不清空 displayedPosts：保留旧列表避免文档高度骤降导致浏览器钳制滚动跳顶
    hasMore.value = true;
  }

  try {
    const params = {
      page: currentPage.value,
      pageSize,
      category_id: activeCategory.value ?? undefined,
      tag: activeTag.value ?? undefined
    };
    // 关键词存在时走搜索接口以支持相关性检索，否则走普通列表
    const data = activeKeyword.value
      ? await searchArticles({ ...params, keyword: activeKeyword.value })
      : await list(params);

    // 接口异常返回缺失字段时做降级处理
    const articles = Array.isArray(data?.articles) ? data.articles : [];
    const newPosts = articles.map(articleToBlogPost);

    if (reset) {
      // 新数据整体替换，保证中间态高度稳定
      displayedPosts.value = newPosts;
    } else {
      displayedPosts.value.push(...newPosts);
    }

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
    hasLoadedOnce.value = true;
  }
};

// 切换分类
const selectCategory = (categoryId: number | null) => {
  activeCategory.value = categoryId;
  loadArticles(true);
};

// 切换标签：再次点击同一标签则取消选中
const selectTag = (tagName: string | null) => {
  activeTag.value = activeTag.value === tagName ? null : tagName;
  loadArticles(true);
};

// // 提交搜索
// const submitSearch = () => {
//   activeKeyword.value = keyword.value.trim();
//   loadArticles(true);
// };

// // 清空搜索
// const clearSearch = () => {
//   keyword.value = '';
//   activeKeyword.value = '';
//   loadArticles(true);
// };

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

// 首屏数据已由 useAsyncData 预取；仅在预取失败时退回客户端加载
onMounted(() => {
  if (initialData.value) return;
  loadCategories();
  loadTags();
  loadHeroPosts();
  loadArticles();
});
</script>

<template>
  <div class="min-h-screen bg-canvas pb-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
      <!-- 头部宣传区域：独立轮播板块（banner 接口 blog_top_banner 位，不随筛选变化）。
           尺寸/圆角/间距由页面控制，全宽下桌面端封顶 60% 屏高 -->
      <BlogHeroCarousel
        :posts="heroPosts"
        class="aspect-[4/3] md:aspect-[16/11] md:max-h-[60vh] rounded-3xl mb-6"
      />

      <!-- 筛选器: 分类标签Filter Tabs -->
      <div
        class="flex flex-wrap items-center justify-start gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide"
      >
        <button
          class="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
          :class="[
            activeCategory === null
              ? 'bg-fg text-canvas'
              : 'bg-surface-muted text-fg-muted hover:bg-fg hover:text-canvas'
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
              ? 'bg-fg text-canvas'
              : 'bg-surface-muted text-fg-muted hover:bg-fg hover:text-canvas'
          ]"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
        <!-- RSS 订阅按钮，未来可设置为用户订阅、加载更多 -->
        <button class="p-2 text-fg-subtle hover:text-fg">
          <div class="i-carbon-rss w-5 h-5"></div>
        </button>
      </div>

      <!-- 标签筛选行：无标签数据时整行隐藏 -->
      <div v-if="tagList.length > 0" class="flex flex-wrap items-center gap-2 mb-12">
        <div class="i-carbon-tag w-4 h-4 text-fg-subtle shrink-0"></div>
        <button
          v-for="tag in tagList"
          :key="tag.id"
          class="px-3 py-1 rounded-full text-xs font-medium border transition-all"
          :class="[
            activeTag === tag.name
              ? 'text-white border-transparent bg-[var(--tag-color)]'
              : 'border-line text-fg-muted hover:text-white hover:border-transparent hover:bg-[var(--tag-color)]'
          ]"
          :style="{ '--tag-color': tag.color || '#6B7280' }"
          @click="selectTag(tag.name)"
        >
          {{ tag.name }}
        </button>
        <UButton
          v-if="activeTag"
          class="bg-btn-lpurple text-btn-lpurple-text hover:bg-btn-lpurple-hover"
          variant="soft"
          size="sm"
          @click="selectTag(null)"
        >
          <template #leading>
            <span class="i-carbon-reset w-4 h-4" />
          </template>
          清除标签
        </UButton>
      </div>

      <!-- 首屏加载骨架：与 BlogCard 同构占位，避免白屏等待 -->
      <div
        v-if="showInitialSkeleton"
        class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 mb-20"
        aria-hidden="true"
      >
        <div v-for="i in 6" :key="i" class="flex flex-col gap-4 animate-pulse">
          <div class="aspect-[16/9] w-full rounded-2xl bg-surface-muted"></div>
          <div class="flex flex-col gap-3">
            <div class="h-3 w-16 rounded bg-surface-muted"></div>
            <div class="h-6 w-4/5 rounded bg-surface-muted"></div>
            <div class="h-4 w-full rounded bg-surface-muted"></div>
            <div class="pt-2 flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-surface-muted"></div>
              <div class="h-3 w-24 rounded bg-surface-muted"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="isEmpty" class="text-center py-20 text-fg-subtle">
        <div class="text-5xl flex items-center justify-center gap-2 mb-4">
          <div class="i-carbon-blog w-12 h-12"></div>
        </div>
        <p class="text-sm">
          {{
            activeKeyword ? `没有找到与「${activeKeyword}」相关的文章` : '暂无文章，换个分类试试吧'
          }}
        </p>
      </div>

      <!-- 文章内容布局Blog Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 mb-20">
        <BlogCard v-for="blogPost in displayedPosts" :key="blogPost.id" :blog-post="blogPost" />
      </div>

      <!-- 加载更多触发器 / 底部状态 -->
      <div
        v-if="!isEmpty && !showInitialSkeleton"
        ref="loadMoreTrigger"
        class="flex justify-center mt-12 py-8"
      >
        <div v-if="isLoading" class="flex items-center gap-2 text-fg-muted">
          <div class="i-carbon-circle-dash w-6 h-6 animate-spin"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="!hasMore" class="text-fg-subtle text-sm">- 到底了，没有更多内容了 -</div>
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
