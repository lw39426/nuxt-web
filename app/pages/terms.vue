<script setup lang="ts">
definePageMeta({ layout: 'default' });

const pageTitle = '用户服务协议';
const lastUpdated = '2026年9月15日';

/**
 * 用户服务协议页 SEO 元信息
 * - 该页已从 sitemap 中排除，此处仅补充页面级 title
 */
useSeoMeta({
  title: '用户服务协议',
  description:
    'YouMi 角色百科用户服务协议，说明使用本站服务时您与平台之间的权利义务、账号规范与内容版权约定。'
});

const sections = [
  {
    title: '1. 服务条款的接受',
    content: `欢迎访问 YouMi。通过访问或使用我们的服务，您同意遵守本协议的所有条款和条件。如果您不同意本协议，请勿使用我们的服务。`
  },
  {
    title: '2. 服务说明',
    content: `YouMi 是一个面向动漫/影视爱好者的角色百科与沉浸式浏览平台，提供：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>角色信息浏览和搜索</li>
      <li>角色资料详情查看</li>
      <li>收藏和签到功能</li>
      <li>博客文章阅读</li>
    </ul>`
  },
  {
    title: '3. 用户账号',
    content: `使用某些功能需要注册账号。您需要：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>提供真实、准确的注册信息</li>
      <li>妥善保管账号密码</li>
      <li>对账号下的所有活动负责</li>
    </ul>`
  },
  {
    title: '4. 用户行为规范',
    content: `您同意不会：
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>使用服务进行任何非法活动</li>
      <li>干扰或破坏服务的正常运行</li>
      <li>尝试获取未经授权的访问权限</li>
      <li>侵犯他人知识产权</li>
    </ul>`
  },
  {
    title: '5. 知识产权',
    content: `本平台上的所有内容（包括但不限于文字、图片、视频、软件）均受知识产权法保护。未经许可，您不得复制、修改、分发或公开传播这些内容。`
  },
  {
    title: '6. 免责声明',
    content: `本平台提供的角色信息仅供娱乐和学习参考，不代表任何官方立场。我们不对因使用本平台内容而产生的任何损失负责。`
  },
  {
    title: '7. 链接和第三方服务',
    content: `本平台可能包含指向第三方网站的链接。我们不对这些第三方网站的内容或隐私政策负责。`
  },
  {
    title: '8. 协议修改',
    content: `我们保留随时修改本协议的权利。修改后的协议将在本页面发布，并注明最后更新日期。继续使用我们的服务即表示您接受修改后的协议。`
  },
  {
    title: '9. 联系我们',
    content: `如果您对本协议有任何疑问，请通过以下方式联系我们：
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
          欢迎使用 YouMi（以下简称"我们"）。请仔细阅读以下服务条款，这些条款适用于您对 YouMi
          平台的所有访问和使用。
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
