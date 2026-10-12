<script setup lang="ts">
definePageMeta({ layout: 'default' });

const pageTitle = '隐私政策';
const lastUpdated = '2026年9月15日';

/**
 * 隐私政策页 SEO 元信息
 * - 该页已从 sitemap 中排除，此处仅补充页面级 title，避免出现无标题页面
 */
useSeoMeta({
  title: '隐私政策',
  description:
    'YouMi 角色百科隐私政策，说明我们如何收集、使用、存储与保护您的个人信息，以及您享有的相关权利。'
});

const sections = [
  {
    title: '1. 信息收集',
    content: `我们收集以下信息以提供更好的服务：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>账号信息：用户名、邮箱地址</li>
      <li>设备信息：浏览器类型、操作系统、IP 地址</li>
      <li>使用数据：访问时间、浏览历史、搜索记录</li>
    </ul>`
  },
  {
    title: '2. 信息使用',
    content: `我们使用收集的信息用于：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>提供和维护我们的服务</li>
      <li>改善用户体验</li>
      <li>发送服务通知和更新</li>
      <li>防止滥用和安全威胁</li>
    </ul>`
  },
  {
    title: '3. 信息共享',
    content: `我们不会出售或出租您的个人信息。我们可能在以下情况下共享信息：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>获得您的明确同意</li>
      <li>遵守法律要求</li>
      <li>保护我们的合法权益</li>
    </ul>`
  },
  {
    title: '4. Cookie 使用',
    content: `我们使用 Cookie 和类似技术来：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>记住您的登录状态</li>
      <li>分析网站流量和使用模式</li>
      <li>提供个性化内容推荐</li>
    </ul>`
  },
  {
    title: '5. 数据安全',
    content: `我们采取合理措施保护您的个人信息安全，包括但不限于：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>使用加密技术传输数据</li>
      <li>定期安全审查</li>
      <li>限制员工对个人信息的访问</li>
    </ul>`
  },
  {
    title: '6. 您的权利',
    content: `您有权：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>访问您的个人信息</li>
      <li>更正不准确的信息</li>
      <li>请求删除您的个人信息</li>
      <li>选择退出某些数据收集</li>
    </ul>`
  },
  {
    title: '7. 未成年人保护',
    content: `我们重视未成年人隐私保护。如果您是未满18周岁的未成年人，请在监护人指导下使用我们的服务。`
  },
  {
    title: '8. 政策更新',
    content: `我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，并注明最后更新日期。`
  },
  {
    title: '9. 联系我们',
    content: `如果您对本隐私政策有任何疑问，请通过以下方式联系我们：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>邮箱：2308739426@qq.com</li>
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
        <p class="text-fg-muted mb-8">
          欢迎访问
          YouMi（以下简称"我们"）。我们非常重视您的隐私保护。本隐私政策说明了我们如何收集、使用和保护您的个人信息。
        </p>

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
