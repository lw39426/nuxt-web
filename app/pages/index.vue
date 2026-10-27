<script setup lang="ts">
import { useHomeApi } from '~/composables/api/home';
import FeaturedCharacters from '~/components/home/FeaturedCharacters.vue';
import AiAssistant from '~/components/home/AiAssistant.vue';
import LatestNews from '~/components/home/LatestNews.vue';

useHead({
  link: [
    { rel: 'preconnect', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' }
  ]
});

/**
 * 首页 SEO 元信息
 * - title 使用「品牌名 | 标语」形式，避免与全站 titleTemplate 叠加导致品牌名重复
 * - description 覆盖全站默认描述，突出首页核心价值
 * - canonical / og:url 由 nuxt-seo-utils 依据 site.url 自动生成
 */
useSeoMeta({
  title: 'YouMi 角色百科',
  titleTemplate: '%s | 每一个角色，都值得被认真看见',
  description:
    'YouMi 角色百科 —— 面向动漫与影视爱好者的角色图鉴平台，收录海量角色档案、能力设定与人物关系，支持 AI 角色问答与多角色对比。'
});

const { getHomeData } = useHomeApi();

// 获取首页聚合数据
const { data: homeData } = await useAsyncData('home-config', () => getHomeData());

// 解构数据
const featuredCharacters = computed(() => homeData.value?.hot_products || []);
const featuredTagName = computed(() => homeData.value?.featured?.tag_name || '精选角色');
const articles = computed(() => homeData.value?.articles || []);

// const bgImage = computed(() => '/futuristic-moon-background.webp');
/** 首页 Hero 背景图（banner） */
const bgImage = computed(() => '/hero02.jpeg');

const aiQuestion = ref('');
const canAskAI = computed(() => aiQuestion.value.trim().length > 0);

const askAI = (question?: string) => {
  const normalizedQuestion = (question ?? aiQuestion.value).trim();
  if (!normalizedQuestion) return;

  navigateTo({
    path: '/ai-page',
    query: { question: normalizedQuestion }
  });
};
</script>

<template>
  <main>
    <!-- ========== 1. Hero Section ========== -->
    <!-- 移动端：占位 60 + 区块 calc(100svh-60) = 恰好一屏，内容垂直居中；
         桌面保留原布局（h-svh + 顶部 pt-24） -->
    <section
      class="relative flex min-h-[calc(100svh_-_60px)] items-center md:h-svh md:min-h-0 md:items-start"
    >
      <!-- 背景图 -->
      <picture
        class="bg-image-hero absolute -top-[60px] h-[calc(100%_+_60px)] w-full md:-top-20 md:h-full"
      >
        <img
          class="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          :src="bgImage"
          alt="YouMi 角色百科"
        />
      </picture>

      <!-- 英雄标题板块 -->
      <div class="relative z-10 section-container w-full pb-8 text-center md:pb-0 md:pt-24">
        <h3 class="text-white font-bold tracking-tight font-display drop-shadow-md">
          <span class="block text-[2.5rem] leading-[1.1] md:text-6xl md:leading-tight">YouMi</span>
          <span class="mt-2 block text-[1.5rem] leading-[1.3] md:mt-0 md:text-6xl md:leading-tight">
            每一个角色，都值得被认真看见
          </span>
        </h3>
        <p
          class="mx-auto mt-4 max-w-[36ch] text-[15px] leading-[1.7] font-medium text-[#bfaeed] drop-shadow-sm md:mt-6 md:max-w-2xl md:text-xl"
        >
          It is wonderful, and at the same time it is also terrible. Please be more tolerant, thank
          you very much.
        </p>

        <!-- 毛玻璃搜索 Input Form -->
        <div
          class="mx-auto mt-7 flex h-12 max-w-md rounded-full border border-white/30 bg-white/20 p-1 shadow-lg backdrop-blur-md md:mt-12 md:h-auto md:p-1.5"
        >
          <input
            v-model="aiQuestion"
            type="text"
            placeholder="你想了解什么？"
            class="min-w-0 flex-1 bg-transparent border-none outline-none text-fg placeholder:text-fg-subtle px-4 text-base md:text-sm"
            @keydown.enter.prevent="askAI()"
          />
          <button
            class="h-full shrink-0 rounded-full bg-white text-black/70 px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:bg-gray-100 md:px-6 md:py-2"
            :disabled="!canAskAI"
            @click="askAI()"
          >
            立即体验
          </button>
        </div>
      </div>
    </section>

    <!-- ========== 2. 精选角色卡片墙 ========== -->
    <FeaturedCharacters :characters="featuredCharacters" :featured-tag-name="featuredTagName" />

    <!-- ========== 3. 专属AI助手 ========== -->
    <AiAssistant />

    <!-- ========== 4. 沉浸式互动体验 ========== -->
    <!-- <ImmersiveExperience /> -->

    <!-- ========== 5. 最新资讯 ========== -->
    <LatestNews :articles="articles" />
  </main>
</template>

<style scoped>
/* Hero background image mask */
.bg-image-hero {
  -webkit-mask-image: linear-gradient(
    #000 0%,
    rgba(0, 0, 0, 0.99) 18.5%,
    rgba(0, 0, 0, 0.953) 34.3%,
    rgba(0, 0, 0, 0.894) 47.6%,
    rgba(0, 0, 0, 0.824) 58.5%,
    rgba(0, 0, 0, 0.74) 67.5%,
    rgba(0, 0, 0, 0.647) 74.7%,
    rgba(0, 0, 0, 0.55) 80.3%,
    rgba(0, 0, 0, 0.45) 84.7%,
    rgba(0, 0, 0, 0.353) 88%,
    rgba(0, 0, 0, 0.26) 90.5%,
    rgba(0, 0, 0, 0.176) 92.5%,
    rgba(0, 0, 0, 0.106) 94.2%,
    rgba(0, 0, 0, 0.047) 95.9%,
    rgba(0, 0, 0, 0.01) 97.7%,
    transparent 100%
  );
  mask-image: linear-gradient(
    #000 0%,
    rgba(0, 0, 0, 0.99) 18.5%,
    rgba(0, 0, 0, 0.953) 34.3%,
    rgba(0, 0, 0, 0.894) 47.6%,
    rgba(0, 0, 0, 0.824) 58.5%,
    rgba(0, 0, 0, 0.74) 67.5%,
    rgba(0, 0, 0, 0.647) 74.7%,
    rgba(0, 0, 0, 0.55) 80.3%,
    rgba(0, 0, 0, 0.45) 84.7%,
    rgba(0, 0, 0, 0.353) 88%,
    rgba(0, 0, 0, 0.26) 90.5%,
    rgba(0, 0, 0, 0.176) 92.5%,
    rgba(0, 0, 0, 0.106) 94.2%,
    rgba(0, 0, 0, 0.047) 95.9%,
    rgba(0, 0, 0, 0.01) 97.7%,
    transparent 100%
  );
}
</style>
