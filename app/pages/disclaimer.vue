<script setup lang="ts">
definePageMeta({ layout: 'default' });

const pageTitle = '免责声明';
const lastUpdated = '2026年9月15日';

const sections = [
  {
    title: '1. 非官方粉丝站声明',
    content: `<p class="mb-4">YouMi 是一个独立的粉丝社区平台，由个人开发者运营维护。我们与以下版权方没有任何关联、赞助或授权关系：</p>
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>动漫、影视作品的制作公司</li>
      <li>游戏开发商</li>
      <li>角色设计者或版权所有者</li>
    </ul>
    <p class="mt-4">本站所有内容均为粉丝创作和整理，仅供娱乐和学习参考。</p>`
  },
  {
    title: '2. 角色形象和名称',
    content: `本站展示的角色形象、名称及相关内容均来源于公开网络资源，版权归原作者所有。本站使用这些内容旨在：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>提供角色信息的集中展示</li>
      <li>促进粉丝之间的交流和讨论</li>
      <li>记录和分享对作品的热爱</li>
    </ul>
    <p class="mt-4">如果您是版权方且认为本站内容侵犯了您的权益，请联系我们，我们将立即处理。</p>`
  },
  {
    title: '3. 内容准确性',
    content: `本站提供的角色信息、评分和描述均由用户贡献或从公开资料整理而来。我们：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>不保证信息的完全准确性</li>
      <li>不承担因信息错误导致的任何损失</li>
      <li>鼓励用户通过官方渠道验证重要信息</li>
    </ul>`
  },
  {
    title: '4. 用户行为',
    content: `本站提供的角色信息仅供娱乐和学习参考，不代表任何官方立场。我们不对因使用本平台内容而产生的任何损失负责。`
  },
  {
    title: '5. 商业用途',
    content: `本站明确禁止将本站内容用于商业用途。如果您希望将本站内容用于商业目的，请获得相关版权所有者的授权。`
  },
  {
    title: '6. 外部链接',
    content: `本站可能包含指向外部网站的链接。我们不对这些外部网站的内容、隐私政策或安全性负责。`
  },
  {
    title: '7. 政策更新',
    content: `我们可能会不时更新本免责声明。更新后的免责声明将在本页面发布，并注明最后更新日期。`
  },
  {
    title: '8. 联系我们',
    content: `如果您对本免责声明有任何疑问，请通过以下方式联系我们：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>邮箱：disclaimer@youmi.com</li>
    </ul>`
  }
];
</script>

<template>
  <div class="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-fg mb-2">{{ pageTitle }}</h1>
        <p class="text-fg-muted">最后更新：{{ lastUpdated }}</p>
      </div>

      <!-- 内容区域 -->
      <div class="prose prose-lg max-w-none">
        <div
          class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8"
        >
          <p class="text-yellow-800 dark:text-yellow-200 font-medium">
            重要声明：本站为非官方粉丝站，与任何版权方没有关联或授权关系。
          </p>
        </div>

        <div v-for="section in sections" :key="section.title" class="mb-8">
          <h2 class="text-xl font-semibold text-fg mb-3">{{ section.title }}</h2>
          <div class="text-fg-muted leading-relaxed" v-html="section.content" />
        </div>
      </div>

      <!-- 返回链接 -->
      <div class="mt-12 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center text-brand hover:text-brand-hover transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
