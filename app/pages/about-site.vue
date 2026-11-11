<script setup lang="ts">
definePageMeta({ hideAiEntry: true });

useSeoMeta({
  title: '关于网站',
  description:
    '了解 YouMi 角色百科。浏览动漫、影视和游戏角色档案，按地区探索原神角色，阅读文章或使用站内搜索。'
});

const features = [
  {
    title: '角色图鉴',
    description:
      '按作品或标签浏览角色档案，了解角色背景、能力和人物关系，也可以把感兴趣的角色加入对比。',
    to: '/products',
    icon: 'i-lucide-library-big'
  },
  {
    title: '原神角色',
    description: '从蒙德、璃月等地区出发，查看角色立绘、元素与配音资料。',
    to: '/character/mondstadt',
    icon: 'i-lucide-map'
  },
  {
    title: '文章',
    description: '按分类浏览站内文章，发现图鉴之外值得一读的内容。',
    to: '/blog',
    icon: 'i-lucide-file-text'
  },
  {
    title: '小星 AI',
    description: '用对话了解感兴趣的角色，或从一个问题开始探索。',
    to: '/ai-page',
    icon: 'i-lucide-sparkles'
  }
];
</script>

<template>
  <main class="bg-canvas px-4 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-12">
    <div class="mx-auto max-w-6xl">
      <section
        class="site-intro grid items-center gap-6 rounded-3xl bg-canvas-elevated p-5 sm:p-8 md:gap-8 lg:p-10"
        aria-labelledby="about-site-title"
      >
        <div class="min-w-0">
          <h1
            id="about-site-title"
            class="text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl lg:text-5xl"
          >
            关于 YouMi 角色百科
          </h1>
          <p class="mt-4 max-w-lg text-sm leading-relaxed text-fg-muted sm:text-base">
            YouMi
            是面向动漫、影视和游戏爱好者的独立角色百科。从一部作品出发，了解角色的背景、能力与关系，也可以用站内搜索直接找到感兴趣的角色、商品或文章。
          </p>
          <NuxtLink
            to="/search"
            class="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-semibold text-canvas transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
          >
            <span class="i-lucide-search h-4 w-4" aria-hidden="true" />
            站内搜索
          </NuxtLink>
        </div>
        <img
          src="/hero02.jpeg"
          alt=""
          width="2848"
          height="1600"
          class="aspect-[2/1] w-full rounded-2xl object-cover object-[75%_70%] md:aspect-[4/3]"
          decoding="async"
        />
      </section>

      <section class="mt-9 sm:mt-12" aria-labelledby="about-site-features">
        <h2 id="about-site-features" class="text-xl font-semibold text-fg sm:text-2xl">
          在 YouMi 可以做什么
        </h2>
        <ul class="mt-4 grid gap-x-8 border-y border-line sm:grid-cols-2">
          <li v-for="feature in features" :key="feature.to" class="feature-item min-w-0">
            <NuxtLink
              :to="feature.to"
              class="group flex h-full items-start gap-3 rounded-lg py-4 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent sm:gap-4 sm:px-2"
            >
              <span
                class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-fg"
                aria-hidden="true"
              >
                <span :class="feature.icon" class="h-5 w-5" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-semibold text-fg">{{ feature.title }}</span>
                <span class="mt-1 block text-sm leading-relaxed text-fg-muted">{{
                  feature.description
                }}</span>
              </span>
              <span
                class="i-lucide-arrow-up-right mt-1 h-4 w-4 shrink-0 text-fg-muted group-hover:text-fg"
                aria-hidden="true"
              />
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section
        class="mt-8 rounded-2xl bg-canvas-elevated p-5 sm:mt-10 sm:p-6"
        aria-labelledby="about-site-editorial"
      >
        <h2 id="about-site-editorial" class="text-lg font-semibold text-fg">内容与维护</h2>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">
          YouMi
          是由入梦维护的非官方粉丝站。角色资料供浏览与参考，相关作品与角色的版权归各自权利人所有。
        </p>
        <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          <NuxtLink
            to="/about"
            class="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-fg hover:underline"
          >
            关于作者
            <span class="i-lucide-arrow-right h-4 w-4" aria-hidden="true" />
          </NuxtLink>
          <NuxtLink
            to="/disclaimer"
            class="inline-flex min-h-11 items-center text-sm text-fg-muted hover:text-fg hover:underline"
          >
            免责声明
          </NuxtLink>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.feature-item + .feature-item {
  border-top: 1px solid var(--line);
}

@media (width >= 640px) {
  .feature-item:nth-child(2) {
    border-top: none;
  }
}

@media (width >= 768px) {
  .site-intro {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  }
}
</style>
