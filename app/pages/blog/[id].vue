<script setup lang="ts">
const route = useRoute()
const id = route.params.id

// Mock Data for Detail Page
const post = {
  id: Number(id),
  title: 'Introducing the Mintlify Agent to write documentation with AI',
  category: 'Announcements',
  date: 'September 29, 2025',
  readTime: '2 min read',
  image:
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
  author: {
    name: 'Han Wang',
    role: 'Co-Founder',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
  },
  content: `
    <p class="mb-6">Documentation is the bridge between your code and your users. But keeping it up to date is a constant struggle. As codebases evolve, documentation often lags behind, leading to confusion and frustration.</p>
    
    <p class="mb-6">Today, we're excited to introduce the <strong>Mintlify Agent</strong>, a new way to maintain your documentation using AI. The Agent automatically monitors your pull requests, Slack threads, and other sources to suggest updates to your documentation.</p>

    <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">How it works</h2>
    <p class="mb-6">The Mintlify Agent integrates directly into your workflow. When you merge a PR that changes an API endpoint, the Agent detects the change and drafts a pull request to update your documentation.</p>
    
    <ul class="list-disc pl-6 mb-6 space-y-2">
      <li><strong>Automatic Detection:</strong> Monitors your codebase for changes.</li>
      <li><strong>Context Aware:</strong> Understands the context of your changes from PR descriptions and comments.</li>
      <li><strong>Human in the Loop:</strong> You always have the final say. Review and approve changes before they go live.</li>
    </ul>

    <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Getting Started</h2>
    <p class="mb-6">The Mintlify Agent is available today for all Enterprise customers. To get started, simply enable the integration in your dashboard.</p>
  `
}

// Related Posts Mock
const relatedPosts = [
  {
    id: 2,
    title: 'Impact of SHA1-Hulud: The Second Coming on the Mintlify CLI',
    excerpt: 'The Mintlify CLI was briefly exposed to a supply chain attack.',
    category: 'ANNOUNCEMENTS',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
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
    author: {
      name: 'Han Wang',
      role: 'Co-Founder',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
    }
  }
]
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-black pb-20">
    <!-- Back Button -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <NuxtLink to="/blog" class="inline-flex items-center gap-2 group">
        <div
          class="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-transform group-hover:-translate-x-1"
        >
          <div class="i-carbon-arrow-left w-5 h-5" />
        </div>
        <span class="font-medium text-gray-900 dark:text-white">所有故事</span>
      </NuxtLink>
    </div>

    <!-- Article Header -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-12 text-center">
      <div
        class="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6"
      >
        <span class="uppercase tracking-wider">{{ post.category }}</span>
        <span class="text-gray-300 dark:text-gray-700">•</span>
        <span class="text-gray-500 dark:text-gray-400">{{ post.date }}</span>
        <span class="text-gray-300 dark:text-gray-700">•</span>
        <span class="text-gray-500 dark:text-gray-400">{{ post.readTime }}</span>
      </div>

      <h1 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
        {{ post.title }}
      </h1>

      <div class="flex items-center justify-center gap-3 mb-12">
        <img
          :src="post.author.avatar"
          :alt="post.author.name"
          class="h-12 w-12 rounded-full object-cover"
        />
        <div class="text-left">
          <div class="font-bold text-gray-900 dark:text-white">{{ post.author.name }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ post.author.role }}</div>
        </div>
      </div>
    </div>

    <!-- Featured Image -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div class="aspect-[2/1] rounded-3xl overflow-hidden shadow-2xl">
        <img :src="post.image" :alt="post.title" class="w-full h-full object-cover" />
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <article class="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
        <div v-html="post.content"></div>
      </article>

      <!-- Share / Tags (Optional) -->
      <div
        class="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center"
      >
        <div class="text-sm text-gray-500">Share this article</div>
        <div class="flex gap-4">
          <button
            class="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            <div class="i-carbon-logo-twitter w-5 h-5"></div>
          </button>
          <button
            class="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            <div class="i-carbon-logo-linkedin w-5 h-5"></div>
          </button>
          <button
            class="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            <div class="i-carbon-link w-5 h-5"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Related Posts -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Read next</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BlogCard v-for="related in relatedPosts" :key="related.id" :post="related as any" />
      </div>
    </div>
  </div>
</template>
