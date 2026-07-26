<script setup lang="ts">
import GsapHome from '~/components/home/GsapHome.vue';
import { useThemeStore } from '~/stores/theme';
import { useHomeApi } from '~/composables/api/home';
// 模拟Logo墙数据
const _brands = [
  'Anthropic',
  'Coinbase',
  'Microsoft',
  'Perplexity',
  'HubSpot',
  'X',
  'Cursor',
  'PayPal'
];

const _routeLink = [
  {
    name: 'Home',
    link: '/'
  },
  {
    name: 'navbar-60fps-test',
    link: '/navbar-60fps-test'
  },
  {
    name: 'performance-test',
    link: '/performance-test'
  }
];

const themeStore = useThemeStore();
const themeMode = computed(() => themeStore.mode);
const prefersDark = ref(false);

if (import.meta.client) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const updatePreferredTheme = () => {
    prefersDark.value = media.matches;
  };

  updatePreferredTheme();

  onMounted(() => {
    media.addEventListener?.('change', updatePreferredTheme);
    media.addListener?.(updatePreferredTheme);
  });

  onBeforeUnmount(() => {
    media.removeEventListener?.('change', updatePreferredTheme);
    media.removeListener?.(updatePreferredTheme);
  });
}

// 到时候根据第二板块背景设计，暂时先不使用
const _heroPreviewImage = computed(() => {
  const isDarkTheme =
    themeMode.value === 'dark' || (themeMode.value === 'system' && prefersDark.value);

  return isDarkTheme
    ? 'https://www.mintlify.com/hero/hero-image-dark.svg'
    : 'https://www.mintlify.com/hero/hero-image-light.svg';
});

useHead({
  link: [
    { rel: 'preconnect', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' }
  ]
});

const { getHomeData } = useHomeApi();
// 获取首页配置数据
const { data: _homeConfig } = await useAsyncData('home-config', () => getHomeData());
// 设置动态背景图样式
const _heroStyle = computed(() => {
  return {};
});
const bgImage = computed(() => '/futuristic-moon-background.jpg');

const aiQuestion = ref('');
const canAskAI = computed(() => aiQuestion.value.trim().length > 0);

const askAI = (question?: string) => {
  const normalizedQuestion = (question ?? aiQuestion.value).trim();
  if (!normalizedQuestion) return;

  // 这里我们直接跳转到 AI 体验页，并把问题作为查询参数传递过去，实际开发中你可以选择更合适的方式来传递这个问题
  navigateTo({
    path: '/ai-page',
    query: { question: normalizedQuestion }
  });
};
</script>

<template>
  <main>
    <!-- 1. Hero Section -->
    <section class="relative h-screen !h-svh">
      <!-- 背景-->
      <!-- <div
        class="bg-image-hero h-[80%] w-full absolute top-[-10rem] bg-cover lg:bg-contain bg-no-repeat z-9 select-none pointer-events-none"
        :style="heroStyle"
      /> -->
      <picture class="bg-image-hero top-[-5rem] absolute w-full h-full">
        <img class="w-full h-full object-cover" loading="eager" :src="bgImage" alt="新一代SU7" />
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
          {{
            'It is wonderful, and at the same time it is also terrible. Please be more tolerant, thank you very much.'
          }}
        </p>

        <!-- 毛玻璃搜索  Input Form -->
        <div
          class="max-w-md mx-auto bg-white/20 backdrop-blur-md p-1.5 rounded-full border border-white/30 flex mb-20 shadow-lg"
        >
          <!-- 使用自定义文本颜色 -->
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

    <!-- 2. Logos Section logo部分 -->
    <section
      class="dark:bg-home-black md:px-8 md:pt-24 pt-18 md:pb-18 pb-18 mx-auto flex items-center flex-col justify-between"
    >
      <div
        class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-y-7 md:max-w-5xl w-full items-center"
      >
        <div v-for="i in 4" :key="i" class="md:h-16 h-10 flex items-center justify-center w-full">
          <div class="h-8 w-32 bg-gray-200 dark:bg-[#444] rounded animate-pulse" />
        </div>
      </div>
    </section>

    <!-- 3. Features Bento Grid -->
    <GsapHome />

    <!-- 4. Enterprise Dark Section -->
    <section class="py-18 md:py-24 dark:bg-home-black content-visibility-auto">
      <div class="section-container">
        <!-- 企业级功能介绍 -->
        <div class="mb-12">
          <span class="badge-green mb-2 inline-block">企业智能升级</span>
          <h2 class="text-4xl font-bold font-display mb-4">让企业知识真正可用、可管、可增长</h2>
          <div class="flex justify-between items-end">
            <p class="text-gray-500 dark:text-home-gray max-w-xl">
              无需推倒重来，也能完成知识体系现代化，兼顾安全、合规与规模化运营。
            </p>
            <button
              class="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full text-sm font-medium"
            >
              查看企业方案
            </button>
          </div>
        </div>
        <!-- 客户案例卡片 -->
        <NuxtLink to="/">
          <div
            id="customer-story-panel"
            class="group relative w-full mx-auto max-w-full md:p-16 p-8 bg-background-main rounded-3xl flex flex-col h-[518px] overflow-hidden cursor-pointer"
            role="tabpanel"
            aria-labelledby="customer-story-tab-0"
          >
            <!-- 背景图 -->
            <img
              alt="企业客户案例背景"
              loading="lazy"
              fetchpriority="low"
              decoding="async"
              data-nimg="fill"
              class="object-cover object-center scale-[1.15] select-none bg-background-invert/20"
              src="https://www.mintlify.com/enterprise/anthropic.svg"
              style="
                position: absolute;
                height: 100%;
                width: 100%;
                inset: 0px;
                color: transparent;
                backface-visibility: hidden;
              "
            />
            <!-- 标题副标题 -->
            <p
              class="uppercase font-mono text-white text-xs/4.5 font-semibold tracking-[0.6px] relative z-10"
            >
              客户案例
            </p>
            <h3
              class="text-white text-2xl mt-4 font-medium tracking-[-0.24px] max-w-[28rem] relative z-10"
            >
              看 Anthropic 如何借助平台能力，加速 AI 产品文档协作
            </h3>
            <!-- 阅读更多按钮 -->
            <div class="mt-8 z-10 text-white hover:text-white w-fit">
              <a href="#" class="read-more-btn">
                阅读案例
                <div class="i-carbon-arrow-right" />
              </a>
            </div>
            <!-- 数据展示区域 -->
            <div class="mt-auto flex items-start gap-7 relative z-10">
              <div class="flex flex-col gap-2 w-[12rem]">
                <p class="text-white text-[2.5rem] leading-[110%] tracking-[-0.8px]">2M+</p>
                <p class="text-white/80 text-sm/6 text-balance">月活开发者</p>
              </div>
              <div class="flex flex-col gap-2 w-[12rem]">
                <p class="text-white text-[2.5rem] leading-[110%] tracking-[-0.8px]">3+</p>
                <p class="text-white/80 text-sm/6">已服务产品：Claude API、MCP、Claude Code</p>
              </div>
            </div>
            <div
              class="absolute inset-0 bg-linear-to-t from-background-main to-transparent opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70 transition-opacity duration-200 dark select-none pointer-events-none"
              aria-hidden="true"
            ></div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- 5. 客户案例区 -->
    <section class="py-24 dark:bg-home-black content-visibility-auto">
      <div class="section-container">
        <div class="text-center mb-16">
          <span class="badge-green">客户实践</span>
          <h2 class="text-4xl font-bold font-display mt-2 mb-4">为各行业释放知识价值</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Card 1 -->
          <div class="group cursor-pointer">
            <div class="bg-dark-card">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
                class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <h4 class="text-white text-xl font-bold">perplexity</h4>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-home-gray mb-2">
              Perplexity 如何重构其文档体系与知识入口...
            </p>
            <span class="text-xs font-medium flex items-center gap-1"
              >阅读案例
              <div class="i-carbon-chevron-right" />
            </span>
          </div>
          <!-- Card 2 -->
          <div class="group cursor-pointer">
            <div class="bg-dark-card">
              <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80"
                class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <h4 class="text-white text-xl font-bold">CURSOR</h4>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Cursor 如何在 12 人团队阶段完成规模化文档交付...
            </p>
            <span class="text-xs font-medium flex items-center gap-1"
              >阅读案例
              <div class="i-carbon-chevron-right" />
            </span>
          </div>
          <!-- Card 3 -->
          <div class="group cursor-pointer">
            <div class="bg-dark-card">
              <img
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80"
                class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <h4 class="text-white text-xl font-bold">X</h4>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              X 如何借助平台持续优化开发者体验...
            </p>
            <span class="text-xs font-medium flex items-center gap-1"
              >阅读案例
              <div class="i-carbon-chevron-right" />
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Bottom CTA -->
    <section class="py-24 bg-white dark:bg-home-black text-center">
      <UMarquee :repeat="3" :duration="2000">
        <UIcon name="i-carbon-logo-github" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-discord" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-twitter" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-instagram" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-linkedin" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-facebook" class="size-10 shrink-0 mx-8" />
      </UMarquee>
      <div class="section-container mt-12">
        <h2 class="text-4xl md:text-5xl font-bold font-display mb-6">
          让文档成为你团队的 <br />
          核心竞争力
        </h2>
        <p class="text-gray-500 dark:text-home-gray mb-10">
          与领先团队一起，用今天的建设能力，支撑未来的业务增长。
        </p>
        <div class="flex justify-center gap-4">
          <button
            class="bg-home-black dark:bg-home-white text-white dark:text-black px-8 py-3 rounded-full font-medium hover:scale-105 transition"
          >
            免费开始
          </button>
          <button
            class="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:text-black px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition"
          >
            预约演示
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 800px;
}

/* Hero background image */

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

/* 简单的淡入上浮动画 */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
