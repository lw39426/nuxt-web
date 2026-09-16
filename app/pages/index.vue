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

const { getHomeData } = useHomeApi();

// 获取首页聚合数据
const { data: homeData } = await useAsyncData('home-config', () => getHomeData());

// 解构数据
const featuredCharacters = computed(() => homeData.value?.hot_products || []);
const featuredTagName = computed(() => homeData.value?.featured?.tag_name || '精选角色');
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
          alt="YouMi 角色百科"
        />
      </picture>

      <!-- 英雄标题板块 -->
      <div class="z-10 section-container text-center">
        <h3
          class="text-6xl pt-[3rem] md:pt-24 md:text-6xl font-bold text-white tracking-tight leading-tight mb-6 font-display drop-shadow-md"
          v-html="'YouMi <br /> 每一个角色，都值得被认真看见。'"
        ></h3>
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
            class="flex-1 bg-transparent border-none outline-none text-fg placeholder-fg-subtle px-4 text-sm"
            @keydown.enter.prevent="askAI()"
          />
          <button
            class="bg-white text-black/70 px-6 py-2 rounded-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:bg-gray-100"
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
