<script setup lang="ts">
import { useHomeApi } from '~/composables/api/home'
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
]

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
]

useHead({
  link: [
    { rel: 'preload', as: 'image', href: '/bg-light.png' },
    { rel: 'preconnect', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' }
  ]
})

const { getHomeConfig } = useHomeApi()
// 获取首页配置数据
const { data: homeConfig } = await useAsyncData('home-config', () => getHomeConfig())

// 设置动态背景图样式
const heroStyle = computed(() => {
  if (homeConfig.value?.hero?.backgroundImage) {
    return {
      backgroundImage: `url('${homeConfig.value.hero.backgroundImage}')`
    }
  }
  return {}
})
</script>

<template>
  <main>
    <!-- 1. Hero Section -->
    <section class="relative">
      <!-- 背景-->
      <div
        class="bg-image-hero bg-cover lg:bg-contain bg-no-repeat z-9 select-none pointer-events-none"
        :style="heroStyle"
      />
      <!-- 英雄标题板块 -->
      <div class="relative z-10 section-container text-center">
        <h1
          class="text-5xl pt-[3rem] md:pt-24 md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 font-display drop-shadow-md"
          v-html="homeConfig?.hero?.title || 'The Intelligent <br /> Documentation Platform'"
        ></h1>
        <p
          class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-2 md:mb-10 font-medium drop-shadow-sm"
        >
          {{
            homeConfig?.hero?.subtitle ||
            'Meet the next generation of documentation. AI-native, beautiful out-of-the-box, and built for collaboration.'
          }}
        </p>

        <!-- 毛玻璃搜索 Email Input Form -->
        <div
          class="max-w-md mx-auto bg-white/20 backdrop-blur-md p-1.5 rounded-full border border-white/30 flex mb-20 shadow-lg"
        >
          <!-- 使用自定义文本颜色 -->
          <input
            type="email"
            placeholder="Email address"
            class="flex-1 bg-transparent border-none outline-none text-mingtext-dark/70 dark:text-mingtext-gray placeholder-mingtext-dark/70 dark:placeholder-mingtext-gray px-4 text-sm"
          />
          <button
            class="bg-white text-mingtext-dark/70 px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
          >
            Start now
          </button>
        </div>

        <!-- 苹果浏览器窗口板块 -->
        <div
          class="relative max-w-5xl mx-auto rounded-xl bg-white dark:bg-[#08090a] shadow-hero border border-gray-200 dark:border-gray-800 overflow-hidden animate-fade-in-up"
        >
          <!-- 苹果窗口样式 -->
          <div class="bg-white dark:bg-[#08090a] p-0 aspect-[16/9] relative">
            <!-- 实际开发中这里可以使用 img 标签引用你的截图，或者用 HTML 写出那个界面 -->
            <div class="absolute inset-0 flex">
              <img
                alt="Hero illustration"
                width="1080"
                height="656"
                decoding="async"
                data-nimg="1"
                class="w-full h-auto block dark:hidden select-none bg-background-main"
                style="color: transparent"
                src="https://www.mintlify.com/hero/hero-image-light.svg"
              />
              <img
                alt="Hero illustration"
                width="1080"
                height="656"
                decoding="async"
                data-nimg="1"
                class="w-full h-auto hidden dark:block select-none bg-background-main"
                style="color: transparent"
                src="https://www.mintlify.com/hero/hero-image-dark.svg"
              />
            </div>
          </div>
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
    <HomeFeaturesBentoGrid />

    <!-- 4. Enterprise Dark Section -->
    <section class="py-18 md:py-24 dark:bg-home-black content-visibility-auto">
      <div class="section-container">
        <!-- 企业级功能介绍 -->
        <div class="mb-12">
          <span class="badge-green mb-2 inline-block">ENTERPRISE-REINVENTION</span>
          <h2 class="text-4xl font-bold font-display mb-4">
            Bring intelligence to enterprise knowledge
          </h2>
          <div class="flex justify-between items-end">
            <p class="text-gray-500 dark:text-home-gray max-w-xl">
              Modernize without the rebuild with enterprise-grade professional service & security.
            </p>
            <button
              class="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full text-sm font-medium"
            >
              Explore for enterprise
            </button>
          </div>
        </div>
        <!-- 客户案例卡片 -->
        <NuxtLink to="/customers/anthropic">
          <div
            id="customer-story-panel"
            class="group relative w-full mx-auto max-w-full md:p-16 p-8 bg-background-main rounded-3xl flex flex-col h-[518px] overflow-hidden cursor-pointer"
            role="tabpanel"
            aria-labelledby="customer-story-tab-0"
          >
            <!-- 背景图 -->
            <img
              alt="Anthropic background"
              loading="lazy"
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
              Customer story
            </p>
            <h3
              class="text-white text-2xl mt-4 font-medium tracking-[-0.24px] max-w-[28rem] relative z-10"
            >
              See how Anthropic accelerates AI development with Mintlify
            </h3>
            <!-- 阅读更多按钮 -->
            <div class="mt-8 z-10 text-white hover:text-white w-fit">
              <a href="#" class="read-more-btn">
                Read story
                <div class="i-carbon-arrow-right" />
              </a>
            </div>
            <!-- 数据展示区域 -->
            <div class="mt-auto flex items-start gap-7 relative z-10">
              <div class="flex flex-col gap-2 w-[12rem]">
                <p class="text-white text-[2.5rem] leading-[110%] tracking-[-0.8px]">2M+</p>
                <p class="text-white/80 text-sm/6 text-balance">Monthly active developers</p>
              </div>
              <div class="flex flex-col gap-2 w-[12rem]">
                <p class="text-white text-[2.5rem] leading-[110%] tracking-[-0.8px]">3+</p>
                <p class="text-white/80 text-sm/6">
                  Products serviced: Claude API, MCP, and Claude Code
                </p>
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

    <!-- 5. Customers Carousel -->
    <section class="py-24 dark:bg-home-black content-visibility-auto">
      <div class="section-container">
        <div class="text-center mb-16">
          <span class="badge-green">CUSTOMERS</span>
          <h2 class="text-4xl font-bold font-display mt-2 mb-4">
            Unlock knowledge for any industry
          </h2>
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
              How Perplexity transformed its documentation...
            </p>
            <span class="text-xs font-medium flex items-center gap-1"
              >Read story
              <div class="i-carbon-chevron-right"
            /></span>
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
              How Cursor scaled with just 12 employees...
            </p>
            <span class="text-xs font-medium flex items-center gap-1"
              >Read story
              <div class="i-carbon-chevron-right"
            /></span>
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
              How X is using Mintlify to power the developer experience...
            </p>
            <span class="text-xs font-medium flex items-center gap-1"
              >Read story
              <div class="i-carbon-chevron-right"
            /></span>
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
          Make documentation your <br />
          winning advantage
        </h2>
        <p class="text-gray-500 dark:text-home-gray mb-10">
          Join the leaders of tomorrow to future proof your documentation today.
        </p>
        <div class="flex justify-center gap-4">
          <button
            class="bg-home-black dark:bg-home-white text-white dark:text-black px-8 py-3 rounded-full font-medium hover:scale-105 transition"
          >
            Get started for free
          </button>
          <button
            class="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:text-black px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition"
          >
            Get a demo
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
.bg-image-hero {
  background-position: 50%;
  width: 100%;
  height: 80%;
  position: absolute;
  top: -10rem;
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
