<script setup lang="ts">
import type { HomeCategory } from '~/composables/api/home';

interface Props {
  categories?: HomeCategory[];
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => []
});

interface ExploreItem {
  id: number;
  name: string;
  count: number;
  icon?: string;
  image?: string;
  subcategories?: string[];
}

const exploreItems = computed<ExploreItem[]>(() => {
  if (props.categories && props.categories.length > 0) {
    return props.categories.slice(0, 8).map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: cat.product_count || 0,
      image: cat.image,
      subcategories: cat.children?.slice(0, 3).map((c) => c.name) || []
    }));
  }
  return [
    { id: 1, name: '智能手机', count: 128, icon: 'i-carbon-mobile' },
    { id: 2, name: '笔记本电脑', count: 86, icon: 'i-carbon-laptop' },
    { id: 3, name: '智能穿戴', count: 64, icon: 'i-carbon-watch' },
    { id: 4, name: '音频设备', count: 52, icon: 'i-carbon-headphones' },
    { id: 5, name: '智能家居', count: 43, icon: 'i-carbon-home' },
    { id: 6, name: '摄影器材', count: 37, icon: 'i-carbon-camera' },
    { id: 7, name: '游戏外设', count: 29, icon: 'i-carbon-game-console' },
    { id: 8, name: '配件周边', count: 156, icon: 'i-carbon-tool-box' }
  ];
});

const handleNavigate = (item: any) => {
  navigateTo(`/products?category=${item.id}`);
};
</script>

<template>
  <section class="py-24 md:py-32 bg-white dark:bg-black content-visibility-auto">
    <div class="section-container">
      <!-- 标题区 -->
      <div class="text-center max-w-3xl mx-auto mb-16 md:mb-20">
        <p
          class="text-xs font-bold text-home-accent dark:text-blue-400 uppercase tracking-[0.3em] mb-4"
        >
          探索发现
        </p>
        <h2 class="text-4xl md:text-6xl font-bold mb-5 tracking-tight">
          <span
            class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500"
          >
            探索品牌宇宙
          </span>
        </h2>
        <p class="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
          从全球顶尖品牌到新锐设计，探索属于你的科技生活方式
        </p>
      </div>

      <!-- 分类网格 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div
          v-for="item in exploreItems"
          :key="item.id"
          class="group relative bg-white dark:bg-[#121417] rounded-3xl p-6 md:p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-white/5 hover:border-home-accent/30 dark:hover:border-blue-500/30 hover:shadow-2xl hover:shadow-home-accent/10 dark:hover:shadow-blue-500/5 overflow-hidden"
          @click="handleNavigate(item)"
        >
          <!-- 背景装饰渐变 -->
          <div
            class="absolute -right-4 -top-4 w-24 h-24 bg-home-accent/5 dark:bg-blue-500/5 rounded-full blur-2xl group-hover:bg-home-accent/10 dark:group-hover:bg-blue-500/10 transition-colors duration-500"
          />

          <!-- 图标 -->
          <div
            class="relative w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-home-accent group-hover:text-white dark:group-hover:bg-blue-600"
          >
            <div
              v-if="item.icon"
              :class="[
                item.icon,
                'text-2xl text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors duration-300'
              ]"
            />
            <img
              v-else-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="w-7 h-7 object-contain group-hover:brightness-0 group-hover:invert transition-all duration-300"
            />
          </div>

          <!-- 文字 -->
          <div class="relative">
            <h3
              class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-home-accent dark:group-hover:text-blue-400 transition-colors"
            >
              {{ item.name }}
            </h3>
            <p class="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <span class="font-medium text-gray-900 dark:text-gray-300">{{ item.count }}</span>
              款精选产品
            </p>
          </div>

          <!-- 子分类标签 -->
          <div v-if="item.subcategories?.length" class="flex flex-wrap gap-2 mt-5">
            <span
              v-for="sub in item.subcategories"
              :key="sub"
              class="text-[10px] px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10 transition-all"
            >
              {{ sub }}
            </span>
          </div>
        </div>
      </div>

      <!-- 底部品牌墙 -->
      <div class="mt-24 pt-12 border-t border-gray-100 dark:border-white/5">
        <p
          class="text-center text-xs font-bold text-gray-400 dark:text-gray-500 mb-10 uppercase tracking-[0.3em]"
        >
          TRUSTED PARTNERS
        </p>
        <div
          class="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 dark:opacity-30 grayscale hover:grayscale-0 transition-all duration-700"
        >
          <div
            class="i-carbon-logo-github text-3xl hover:text-gray-900 dark:hover:text-white transition-colors"
          />
          <div class="i-carbon-logo-discord text-3xl hover:text-[#5865F2] transition-colors" />
          <div class="i-carbon-logo-twitter text-3xl hover:text-[#1DA1F2] transition-colors" />
          <div class="i-carbon-logo-npm text-3xl hover:text-[#CB3837] transition-colors" />
          <div class="i-carbon-logo-slack text-3xl hover:text-[#4A154B] transition-colors" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 800px;
}
</style>
