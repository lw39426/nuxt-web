<script setup lang="ts">
/**
 * 沉浸式体验组件的数据配置
 * 包含 3D 预览、AR 试穿、虚拟展厅和 AI 造型师四个核心体验模块
 */
const experiences = [
  {
    id: 1,
    title: '3D 产品预览',
    subtitle: 'PRECISION VIEW',
    desc: '每一处微米级的细节，都在你的掌控之中。支持实时光影渲染与多角度拆解展示。',
    image:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury+minimalist+watch+macro+shot+black+background+studio+lighting&image_size=landscape_16_9',
    stats: '8K 极清'
  },
  {
    id: 2,
    title: 'AR 实景试穿',
    subtitle: 'VIRTUAL FITTING',
    desc: '打破空间界限，将心仪单品瞬间置于真实环境。厘米级空间感知，精准还原材质质感。',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80',
    stats: '实时追踪'
  },
  {
    id: 3,
    title: '虚拟精品展厅',
    subtitle: 'DIGITAL BOUTIQUE',
    desc: '身临其境地漫步于数字孪生空间。沉浸式的动线设计，让购物成为一场感官之旅。',
    image:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ultra+modern+luxury+fashion+boutique+interior+minimalist+architecture+soft+ambient+lighting&image_size=landscape_16_9',
    stats: '360° 全景'
  },
  {
    id: 4,
    title: 'AI 灵感穿搭',
    subtitle: 'INSIGHT STYLIST',
    desc: '不只是搭配，更是对风格的深度洞察。基于你的审美偏好，构建独一无二的视觉语言。',
    image:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=minimalist+fashion+studio+outfit+on+a+mannequin+abstract+art+background+soft+colors&image_size=landscape_16_9',
    stats: '智能建议'
  }
];

const activeExperience = ref(0);
const progress = ref(0);
const autoPlayInterval: ReturnType<typeof setInterval> | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;

/**
 * 启动自动播放逻辑，包括进度条更新
 */
const startAutoPlay = () => {
  progress.value = 0;
  progressInterval = setInterval(() => {
    progress.value += 1;
    if (progress.value >= 100) {
      activeExperience.value = (activeExperience.value + 1) % experiences.length;
      progress.value = 0;
    }
  }, 50); // 5秒轮播一次 (50ms * 100)
};

/**
 * 停止自动播放，清除所有定时器
 */
const stopAutoPlay = () => {
  if (progressInterval) clearInterval(progressInterval);
  if (autoPlayInterval) clearInterval(autoPlayInterval);
};

/**
 * 手动设置激活的体验项
 * @param idx 索引值
 */
const setActive = (idx: number) => {
  activeExperience.value = idx;
  stopAutoPlay();
  startAutoPlay();
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<template>
  <!-- 楼层固定高度：内容垂直居中，切换卡片时内部仅透明度过渡，楼层高度恒定，不影响后续模块 -->
  <section
    class="relative bg-gradient-to-t from-white to-gray-50 dark:from-black dark:to-[#08070f] overflow-hidden h-[980px] md:h-[1200px] lg:h-[780px] flex flex-col justify-center"
  >
    <!-- 背景渐变装饰：保持与 SmartShopping 一致的色调 -->
    <div
      class="absolute top-0 right-0 w-[600px] h-[600px] bg-home-accent/5 dark:bg-home-accent/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none"
    />

    <div class="section-container relative z-10 w-full py-10 lg:py-6">
      <!-- 恢复统一标题规范 -->
      <div class="text-center max-w-3xl mx-auto mb-8 md:mb-10">
        <p class="section-header-label text-home-accent dark:text-home-accent">INTERACTIVE</p>
        <h2 class="section-header-title">沉浸式互动体验</h2>
        <p class="section-header-desc mx-auto">打破屏幕边界，用前沿技术重新定义购物方式</p>
      </div>

      <!-- 主体验区：优化为符合整体风格的卡片化布局 -->
      <div class="grid lg:grid-cols-12 gap-8 md:gap-10 items-center">
        <!-- 左侧：导航列表，对齐项目圆角规范 -->
        <div class="lg:col-span-4 space-y-2">
          <div
            v-for="(exp, idx) in experiences"
            :key="exp.id"
            class="group relative p-4 lg:p-5 rounded-2xl cursor-pointer transition-all duration-500 border"
            :class="
              activeExperience === idx
                ? 'bg-white dark:bg-[#121417] shadow-xl border-gray-100 dark:border-white/10'
                : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5'
            "
            @click="setActive(idx)"
          >
            <div class="flex items-start gap-4">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-500"
                :class="
                  activeExperience === idx
                    ? 'bg-home-accent text-white shadow-lg shadow-home-accent/30'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                "
              >
                0{{ idx + 1 }}
              </div>

              <div class="flex-1 min-w-0 pt-1">
                <h3
                  class="text-lg font-bold transition-colors"
                  :class="
                    activeExperience === idx ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                  "
                >
                  {{ exp.title }}
                </h3>
                <!--
                  CLS 安全方案：
                  描述区固定为 2 行高度（h-[54px]），切换卡片时仅透明度过渡、高度不变，
                  所有卡片展开高度完全一致，左侧列表总高度绝对恒定，不影响后续模块。
                -->
                <p
                  class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pt-2 h-[54px] overflow-hidden line-clamp-2 transition-opacity duration-500 ease-out"
                  :class="activeExperience === idx ? 'opacity-100' : 'opacity-0'"
                >
                  {{ exp.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：海报展示区，对齐项目圆角规范 -->
        <div
          class="lg:col-span-8 relative aspect-[16/10] md:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#121417]"
        >
          <div
            v-for="(exp, idx) in experiences"
            :key="exp.id"
            class="absolute inset-0 transition-all duration-1000 ease-in-out"
            :class="
              activeExperience === idx
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105 pointer-events-none'
            "
          >
            <!-- 背景图片：仅保留微弱的呼吸感 -->
            <img :src="exp.image" :alt="exp.title" class="w-full h-full object-cover" />

            <!-- 遮罩：使用项目常用的渐变规范 -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            />

            <!-- 内容区：对齐项目排版风格 -->
            <div class="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div class="max-w-md">
                <span
                  class="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase mb-3 rounded-full border border-white/20"
                >
                  {{ exp.stats }}
                </span>
                <h4 class="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {{ exp.title }}
                </h4>
              </div>

              <button
                class="hidden md:flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold rounded-full hover:bg-home-accent hover:text-white transition-all duration-300 shadow-lg"
              >
                立即开启
                <div class="i-carbon-arrow-right" />
              </button>
            </div>
          </div>

          <!-- 底部进度条 -->
          <div class="absolute bottom-0 left-0 w-full h-1 bg-white/10">
            <div
              class="h-full bg-home-accent transition-all duration-50"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes progress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.animate-progress {
  animation: progress 5s linear forwards;
}

/* 移除全局的 hover 缩放，保持极简感 */
.group:hover img {
  transform: scale(1.05); /* 仅在激活状态下有极细微的呼吸感，而不是剧烈的缩放 */
}
</style>
