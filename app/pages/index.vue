<script setup lang="ts">
import { useHomeApi } from '~/composables/api/home';
import SmartShopping from '~/components/home/SmartShopping.vue';
import AiAssistant from '~/components/home/AiAssistant.vue';
import ImmersiveExperience from '~/components/home/ImmersiveExperience.vue';
import LatestNews from '~/components/home/LatestNews.vue';

useHead({
  link: [
    { rel: 'preconnect', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' }
  ]
});

const { getHomeData } = useHomeApi();

// 获取首页聚合数据
const { data: homeData } = await useAsyncData('home-config', () => getHomeData());

// 解构数据
const hotProducts = computed(() => homeData.value?.hot_products || []);
const newProducts = computed(() => homeData.value?.new_products || []);
const featuredTagName = computed(() => homeData.value?.featured?.tag_name || '精选推荐');
const articles = computed(() => homeData.value?.articles || []);

const bgImage = computed(() => '/futuristic-moon-background.webp');

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
    <section class="relative h-screen !h-svh">
      <!-- 背景图 -->
      <picture class="bg-image-hero top-[-5rem] absolute w-full h-full">
        <img
          class="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          :src="bgImage"
          alt="新一代SU7"
        />
      </picture>

      <!-- 英雄标题板块 -->
      <div class="z-10 section-container text-center">
        <h1
          class="text-5xl pt-[3rem] md:pt-24 md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 font-display drop-shadow-md"
          v-html="'Just Build It! <br /> Whatever You Want It To Be.'"
        ></h1>
        <p
          class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6 md:mb-12 font-medium drop-shadow-sm"
        >
          It is wonderful, and at the same time it is also terrible. Please be more tolerant, thank
          you very much.
        </p>

        <!-- 毛玻璃搜索 Input Form -->
        <div
          class="max-w-md mx-auto bg-white/20 backdrop-blur-md p-1.5 rounded-full border border-white/30 flex mb-20 shadow-lg"
        >
          <input
            v-model="aiQuestion"
            type="text"
            placeholder="你想了解什么？"
            class="flex-1 bg-transparent border-none outline-none text-mingtext-dark/70 dark:text-mingtext-gray placeholder-mingtext-dark/70 dark:placeholder-mingtext-gray px-4 text-sm"
            @keydown.enter.prevent="askAI()"
          />
          <button
            class="bg-white text-mingtext-dark/70 px-6 py-2 rounded-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:bg-gray-100"
            :disabled="!canAskAI"
            @click="askAI()"
          >
            立即体验
          </button>
        </div>
      </div>
    </section>

    <!-- ========== 3. 智能购物体验 ========== -->
    <SmartShopping
      :hot-products="hotProducts"
      :new-products="newProducts"
      :featured-tag-name="featuredTagName"
    />

    <!-- ========== 4. 专属AI助手 ========== -->
    <AiAssistant />

    <!-- ========== 5. 沉浸式互动体验 ========== -->
    <ImmersiveExperience />

    <!-- ========== 6. 最新资讯 ========== -->
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
