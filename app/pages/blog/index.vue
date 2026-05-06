<script setup lang="ts">
import type { BlogPost } from '~/types/blog';
import { useIntersectionObserver } from '@vueuse/core';

// Mock Data
const heroPost: BlogPost = {
  id: 1,
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

const MOCK_POSTS: BlogPost[] = [
  {
    id: 2,
    title: 'Impact of SHA1-Hulud: The Second Coming on the Mintlify CLI',
    excerpt:
      'The Mintlify CLI was briefly exposed to a supply chain attack. Learn what happened, who was affected, and what actions to take.',
    category: 'ANNOUNCEMENTS',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
    date: 'Sep 28, 2025',
    author: {
      name: 'Han Wang',
      role: 'Co-Founder',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
    }
  },
  {
    id: 3,
    title: 'Documentation is dead. Long live documentation.',
    excerpt: 'How documentation is changing in the age of AI.',
    category: 'AI TRENDS',
    image:
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop',
    date: 'Sep 25, 2025',
    author: {
      name: 'Han Wang',
      role: 'Co-Founder',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
    }
  },
  {
    id: 4,
    title: 'Why we are moving away from Next.js to Nuxt',
    excerpt: 'A deep dive into our technical decision making process and performance benchmarks.',
    category: 'ENGINEERING',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
    date: 'Sep 20, 2025',
    author: {
      name: 'Sarah Chen',
      role: 'Lead Engineer',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'
    }
  },
  {
    id: 5,
    title: 'Designing for the future of developer tools',
    excerpt: 'How we approach design systems and user experience in technical products.',
    category: 'DESIGN',
    image:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop',
    date: 'Sep 15, 2025',
    author: {
      name: 'Alex Morgan',
      role: 'Product Designer',
      avatar:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60'
    }
  }
];

const categories = [
  'All articles',
  'AI trends',
  'Announcements',
  'For founders',
  'Engineering',
  'Design',
  'Best practices'
];
const activeCategory = ref('All articles');

// 无限滚动逻辑Infinite Scroll Logic
const displayedPosts = ref<BlogPost[]>([...MOCK_POSTS]); // 已加载的文章列表
const isLoading = ref(false);
const hasMore = ref(true); // 是否还有更多数据可加载
const loadMoreTrigger = ref<HTMLElement | null>(null); // 加载更多触发元素

/**
 * 加载更多数据
 * 模拟异步请求和分页逻辑
 */
const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return;
  isLoading.value = true;

  // 模拟网络请求延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 模拟加载更多数据 (复制 MOCK_POSTS 并生成新 ID)
  const newPosts = MOCK_POSTS.map((post, index) => ({
    ...post,
    id: Date.now() + index + Math.random()
  }));

  displayedPosts.value.push(...newPosts);

  // 模拟数据上限 (例如超过 40 条就不再加载)
  if (displayedPosts.value.length > 40) {
    hasMore.value = false;
  }

  isLoading.value = false;
};

// 监听滚动触底
useIntersectionObserver(
  loadMoreTrigger,
  (entries) => {
    const entry = entries[0];
    if (entry && entry.isIntersecting) {
      loadMore();
    }
  },
  {
    rootMargin: '0px 0px 300px 0px' // 提前 300px 触发加载，提升流畅度
  }
);
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
          v-for="cat in categories"
          :key="cat"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
          :class="[
            activeCategory === cat
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20'
          ]"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
        <!-- <div class="flex-1"></div> -->
        <!-- RSS 订阅按钮，未来可设置为用户订阅、加载更多 -->
        <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <div class="i-carbon-rss w-5 h-5"></div>
        </button>
      </div>

      <!-- 文章内容布局Blog Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 mb-20">
        <BlogCard v-for="post in displayedPosts" :key="post.id" :post="post" />
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
