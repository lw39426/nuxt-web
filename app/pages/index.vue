<script setup lang="ts">
import desktopHeroPreview from '~/assets/hero02-desktop-preview.webp?inline';
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

const desktopHeroImage = '/hero02-desktop-v1.webp';
const mobileHeroImage = '/hero02-mobile.webp';
const heroImage = useTemplateRef<HTMLImageElement>('heroImage');
const decodedHeroImage = shallowRef('');

/**
 * 图片解码后，显示英雄图片
 * - 等待英雄图片解码完成后，将其标记为可显示。
 * - 解码失败时保留底色，不抛出异常。
 *
 * @returns {Promise<void>}
 */
const revealHeroImage = async () => {
  const image = heroImage.value;
  const source = image?.currentSrc;
  if (!image || !source) return;

  const pathname = new URL(source).pathname;
  if (decodedHeroImage.value === pathname) return;

  try {
    await image.decode();
    if (image.currentSrc === source) decodedHeroImage.value = pathname;
  } catch {
    // 图片无法解码时，保留首屏底色。
  }
};

onMounted(() => {
  if (heroImage.value?.complete) void revealHeroImage();
});

const searchTerm = ref('');
const canSearch = computed(() => searchTerm.value.trim().length > 0);

const submitSearch = () => {
  if (!canSearch.value) return;
  return navigateTo({ path: '/search', query: { q: searchTerm.value.trim() } });
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
        :style="{ '--hero-desktop-preview': `url(${desktopHeroPreview})` }"
      >
        <source media="(width < 768px)" :srcset="mobileHeroImage" />
        <img
          ref="heroImage"
          class="hero-image block h-full w-full object-cover object-center"
          :class="{
            'hero-image-desktop-ready': decodedHeroImage === desktopHeroImage,
            'hero-image-mobile-ready': decodedHeroImage === mobileHeroImage
          }"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          :src="desktopHeroImage"
          alt="YouMi 角色百科"
          @load="revealHeroImage"
        />
      </picture>

      <!-- 英雄标题板块 -->
      <div class="relative z-10 section-container w-full pb-8 text-center md:pb-0 md:pt-24">
        <h1 class="text-white font-bold tracking-tight font-display drop-shadow-md">
          <span class="block text-[2.5rem] leading-[1.1] md:text-6xl md:leading-tight">YouMi</span>
          <span class="mt-2 block text-[1.5rem] leading-[1.3] md:mt-0 md:text-6xl md:leading-tight">
            每一个角色，都值得被认真看见
          </span>
        </h1>
        <p
          class="mx-auto mt-4 max-w-[36ch] text-[15px] leading-[1.7] font-medium text-[#bfaeed] drop-shadow-sm md:mt-6 md:max-w-2xl md:text-xl"
        >
          It is wonderful, and at the same time it is also terrible. Please be more tolerant, thank
          you very much.
        </p>

        <!-- 毛玻璃搜索 Input Form -->
        <form
          role="search"
          class="mx-auto mt-7 flex h-12 max-w-md rounded-full border border-white/30 bg-white/20 p-1 shadow-lg backdrop-blur-md md:mt-12 md:h-auto md:p-1.5"
          @submit.prevent="submitSearch"
        >
          <input
            v-model="searchTerm"
            type="search"
            aria-label="站内搜索"
            placeholder="搜索角色、商品或文章"
            class="min-w-0 flex-1 bg-transparent border-none outline-none text-fg placeholder:text-fg-subtle px-4 text-base md:text-sm"
          />
          <button
            class="h-full shrink-0 rounded-full bg-white text-black/70 px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:bg-gray-100 md:px-6 md:py-2"
            type="submit"
            :disabled="!canSearch"
          >
            搜索
          </button>
        </form>
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

.hero-image {
  opacity: 0;
}

@media (width >= 768px) {
  .bg-image-hero {
    background: center / cover no-repeat var(--hero-desktop-preview);
  }

  .hero-image-desktop-ready {
    opacity: 1;
  }
}

@media (width < 768px) {
  .bg-image-hero {
    background: linear-gradient(180deg, #cbd3f5 0%, #e7def7 45%, #f5e8f3 75%);
  }

  .hero-image-mobile-ready {
    opacity: 1;
  }
}

@media (width < 768px) and (prefers-reduced-motion: no-preference) {
  .hero-image {
    transition: opacity 180ms ease-out;
  }
}
</style>
