<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

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
    role: 'Co-Founder',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
  },
  isHero: true
}

const posts: BlogPost[] = [
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
]

const categories = [
  'All articles',
  'AI trends',
  'Announcements',
  'For founders',
  'Engineering',
  'Design',
  'Best practices'
]
const activeCategory = ref('All articles')

// Pagination
const currentPage = ref(1)
const totalPages = 20
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-black pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <!-- Hero Post -->
      <NuxtLink
        :to="`/blog/${heroPost.id}`"
        class="group relative block w-full aspect-[2/1] md:aspect-[2.5/1] rounded-3xl overflow-hidden mb-12"
      >
        <img
          :src="heroPost.image"
          :alt="heroPost.title"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        ></div>

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
      </NuxtLink>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2 mb-12 overflow-x-auto pb-2 scrollbar-hide">
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
        <div class="flex-1"></div>
        <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <div class="i-carbon-rss w-5 h-5"></div>
        </button>
      </div>

      <!-- Blog Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 mb-20">
        <BlogCard v-for="post in posts" :key="post.id" :post="post" />
      </div>

      <!-- Pagination -->
      <div class="flex justify-center mt-12">
        <UPagination
          v-model:page="currentPage"
          size="xl"
          active-color="success"
          :total="totalPages"
        />
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
