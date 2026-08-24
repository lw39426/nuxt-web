<script setup lang="ts">
interface FooterLink {
  label: string;
  to?: string;
  href?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: '探索',
    links: [
      { label: '全部商品', to: '/products' },
      { label: '热销榜单', to: '/products' },
      { label: '新品上市', to: '/products' },
      { label: '资讯中心', to: '/blog' }
    ]
  },
  {
    title: '服务',
    links: [
      { label: '售后服务', href: '#' },
      { label: '配送说明', href: '#' },
      { label: '退换政策', href: '#' },
      { label: '常见问题', href: '#' }
    ]
  },
  {
    title: '关于',
    links: [
      { label: '关于我们', to: '/about' },
      { label: '加入我们', href: '#' },
      { label: '联系方式', href: '#' },
      { label: 'AI 助手', to: '/ai-page' }
    ]
  },
  {
    title: '法律',
    links: [
      { label: '隐私政策', href: '#' },
      { label: '服务条款', href: '#' },
      { label: 'Cookie 政策', href: '#' }
    ]
  }
];
</script>
<template>
  <footer class="bg-canvas-elevated pt-12 md:pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-5 md:px-8">
      <!-- 上部内容 -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10 mb-12">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <NuxtLink to="/" class="flex items-center gap-2 mb-4">
            <div class="h-7 w-7 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-4 h-4 text-white dark:text-black"
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"
                />
              </svg>
            </div>
            <span class="font-semibold text-base text-fg">Mimo</span>
          </NuxtLink>
          <p class="footer-desc">新一代智能购物平台，用科技连接品质生活。</p>
        </div>

        <!-- 链接列 -->
        <div v-for="column in columns" :key="column.title">
          <h3 class="footer-title">
            {{ column.title }}
          </h3>
          <ul class="space-y-2">
            <li v-for="link in column.links" :key="link.label">
              <NuxtLink v-if="link.to" :to="link.to" class="footer-link">{{ link.label }}</NuxtLink>
              <a v-else :href="link.href" class="footer-link">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="border-t border-line pt-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-3">
          <p class="footer-copy">Copyright © 2026 Mimo. 保留所有权利。</p>
          <div class="flex items-center gap-5">
            <a href="#" class="text-fg-subtle hover:text-fg transition-colors">
              <div class="i-carbon-logo-github w-4 h-4" />
            </a>
            <a href="#" class="text-fg-subtle hover:text-fg transition-colors">
              <div class="i-carbon-logo-twitter w-4 h-4" />
            </a>
            <a href="#" class="text-fg-subtle hover:text-fg transition-colors">
              <div class="i-carbon-logo-instagram w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
