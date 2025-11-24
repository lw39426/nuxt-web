<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
definePageMeta({ layout: 'default' })

// 模拟 Hero 文章数据
const heroPost: BlogPost = {
  id: 0,
  title: 'Introducing the Mintlify Agent to write documentation with AI',
  excerpt: 'Automatically update documentation with context from PRs, Slack threads, or links.',
  category: 'Product',
  date: 'September 29, 2025 • 2 min read',
  image:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop', // 抽象深色背景
  author: {
    name: 'Han Wang',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  }
}

// 模拟文章列表数据
const posts: BlogPost[] = [
  {
    id: 1,
    category: 'Engineering',
    title: 'What I shipped in my first 60 days at Mintlify',
    excerpt: 'Building analytics infrastructure, abuse detection systems, and caching solutions.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    author: {
      name: 'Dens Sumesh',
      role: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
    }
  },
  {
    id: 2,
    category: 'Announcements',
    title: "Terminal Agents Are the Future - We're Launching mint new",
    excerpt:
      "We're launching mint new to bring Mintlify to your terminal workflow. Create docs sites in seconds with terminal agents like Claude Code.",
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80',
    author: {
      name: 'Denzell Ford',
      role: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100'
    }
  },
  {
    id: 3,
    category: 'Announcements',
    title: "How we're making Mintlify documentation more accessible",
    excerpt:
      'Learn about recent accessibility improvements and how Mintlify helps you create documentation that works for users regardless of how they...',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    author: {
      name: 'Ethan Palm',
      role: 'Technical Writing',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    }
  },
  {
    id: 4,
    category: 'Engineering',
    title: 'Building an LSP for your docs',
    excerpt:
      'Adding an IDE experience to codeblocks in your docs is one of the issues that comes up often for people looking to add more context to...',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
    author: {
      name: 'Ricardo Nunez',
      role: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100'
    }
  },
  {
    id: 5,
    category: 'Announcements',
    title: 'The role of good code blocks in documentation',
    excerpt:
      'Learn how Mintlify helps you ship best-in-class code blocks with Twoslash, Shiki and Ask AI.',
    image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80',
    author: {
      name: 'Winona Rajamohan',
      role: 'Marketing',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    }
  },
  {
    id: 6,
    category: 'Product Updates',
    title: 'The /api Namespace is Now Open',
    excerpt:
      'Mintlify now supports documentation pages at the /api path, enabling cleaner URLs that match your API structure.',
    image: 'https://images.unsplash.com/photo-1649180556628-9ba704115795?w=800&q=80',
    author: {
      name: 'Nick Khami',
      role: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100'
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
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-brand-black pb-24 pt-24">
    <main class="section-container pt-6 md:pt-10">
      <!-- 2. Hero Post -->
      <section
        class="relative w-full rounded-3xl overflow-hidden bg-gray-900 text-white aspect-[2/1] md:aspect-[2.4/1] shadow-sm group cursor-pointer"
      >
        <!-- Background Image with Overlay -->
        <div class="absolute inset-0">
          <img
            :src="heroPost.image"
            class="w-full h-full object-cover opacity-60 transition duration-700 group-hover:scale-105"
            alt="Hero"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
          />
        </div>

        <!-- Content -->
        <div
          class="absolute bottom-0 left-0 w-full p-8 md:p-12 max-w-3xl flex flex-col items-start"
        >
          <span class="text-gray-300 text-sm font-medium mb-3">{{ heroPost.date }}</span>
          <h1 class="text-3xl md:text-5xl font-bold leading-tight mb-4">{{ heroPost.title }}</h1>
          <p class="text-gray-300 text-lg mb-8 line-clamp-2 max-w-2xl">{{ heroPost.excerpt }}</p>

          <!-- Hero Author -->
          <div class="flex items-center gap-3">
            <img
              :src="heroPost.author.avatar"
              class="w-10 h-10 rounded-full border border-white/20"
            />
            <div>
              <div class="text-sm font-semibold">{{ heroPost.author.name }}</div>
              <div class="text-xs text-gray-400">{{ heroPost.author.role }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Filter Bar -->
      <section
        class="mt-12 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-transparent"
      >
        <!-- Categories -->
        <div class="flex flex-wrap gap-2 items-center">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="activeCategory === cat ? 'pill-active' : 'pill-inactive'"
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <!-- RSS Icon -->
        <div class="hidden md:block text-gray-400 hover:text-black cursor-pointer">
          <div class="i-carbon-rss text-lg" />
        </div>
      </section>

      <!-- 4. Article Grid -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
        <article
          v-for="post in posts"
          :key="post.id"
          class="group cursor-pointer flex flex-col h-full"
        >
          <!-- Image -->
          <div
            class="overflow-hidden rounded-2xl bg-gray-100 aspect-[16/9] mb-6 border border-gray-100"
          >
            <img
              :src="post.image"
              class="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              :alt="post.title"
            />
          </div>

          <!-- Content -->
          <div class="flex flex-col flex-grow">
            <span class="tag-label">{{ post.category }}</span>

            <h2 class="card-title">{{ post.title }}</h2>

            <p class="text-gray-500 text-base leading-relaxed mb-6 line-clamp-3">
              {{ post.excerpt }}
            </p>

            <!-- Author (Pushed to bottom) -->
            <div class="mt-auto flex items-center gap-3">
              <img
                :src="post.author.avatar"
                class="w-9 h-9 rounded-full bg-gray-200 object-cover"
              />
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-gray-900">{{ post.author.name }}</span>
                <span class="text-xs text-gray-500">{{ post.author.role }}</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <!-- Pagination / Load More (Optional visual cue) -->
      <div class="mt-20 text-center hidden">
        <button
          class="px-6 py-3 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition"
        >
          Load more articles
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 可选：微调字体平滑度，让 Inter 字体看起来更像 Mac 渲染 */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
