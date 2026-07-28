<script setup lang="ts">
const experiences = [
  {
    id: 1,
    title: '3D 产品预览',
    subtitle: '360° 全方位查看',
    desc: '支持360度旋转、缩放、拆解，每个细节尽收眼底',
    icon: 'i-carbon-cube',
    stats: '4K 超清渲染'
  },
  {
    id: 2,
    title: 'AR 实景试穿',
    subtitle: '所见即所得',
    desc: '通过手机摄像头，将商品实时投射到你的真实环境中',
    icon: 'i-carbon-ar',
    stats: '实时追踪'
  },
  {
    id: 3,
    title: '虚拟展厅',
    subtitle: '沉浸式逛店',
    desc: '进入数字孪生展厅，享受如临现场的购物体验',
    icon: 'i-carbon-building',
    stats: 'VR ready'
  },
  {
    id: 4,
    title: '智能搭配',
    subtitle: 'AI 造型师',
    desc: '上传你的穿搭照片，AI为你推荐最佳搭配方案',
    icon: 'i-carbon-color-palette',
    stats: '百万搭配库'
  }
];

const activeExperience = ref(0);

let autoPlayInterval: ReturnType<typeof setInterval> | null = null;

const startAutoPlay = () => {
  autoPlayInterval = setInterval(() => {
    activeExperience.value = (activeExperience.value + 1) % experiences.length;
  }, 4000);
};

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});

const setActive = (idx: number) => {
  activeExperience.value = idx;
  stopAutoPlay();
  startAutoPlay();
};
</script>

<template>
  <section
    class="relative py-24 md:py-32 bg-gray-50 dark:bg-[#08070f] overflow-hidden content-visibility-auto"
  >
    <!-- 背景装饰 -->
    <div
      class="absolute top-0 right-0 w-[600px] h-[600px] bg-home-accent/5 dark:bg-blue-600/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none"
    />

    <div class="section-container relative z-10">
      <!-- 标题区 -->
      <div class="text-center max-w-3xl mx-auto mb-16 md:mb-24">
        <p
          class="text-xs font-bold text-home-accent dark:text-blue-400 uppercase tracking-[0.4em] mb-4"
        >
          互动体验
        </p>
        <h2
          class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
        >
          沉浸式互动体验
        </h2>
        <p class="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
          打破屏幕边界，用前沿技术重新定义购物方式
        </p>
      </div>

      <!-- 主体验区 -->
      <div class="grid lg:grid-cols-5 gap-8 md:gap-12">
        <!-- 左侧：场景列表 -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="(exp, idx) in experiences"
            :key="exp.id"
            class="group relative p-6 rounded-[24px] cursor-pointer transition-all duration-500 border"
            :class="
              activeExperience === idx
                ? 'bg-white dark:bg-[#121417] shadow-xl shadow-black/5 dark:shadow-white/5 border-gray-100 dark:border-white/10'
                : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5 hover:border-gray-100 dark:hover:border-white/5'
            "
            @click="setActive(idx)"
          >
            <div class="flex items-start gap-5">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-500"
                :class="
                  activeExperience === idx
                    ? 'bg-home-accent dark:bg-blue-600 text-white shadow-lg shadow-home-accent/30'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                "
              >
                0{{ idx + 1 }}
              </div>

              <div class="flex-1 min-w-0 pt-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3
                    class="text-lg font-bold transition-colors"
                    :class="
                      activeExperience === idx
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    "
                  >
                    {{ exp.title }}
                  </h3>
                  <span
                    class="text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider"
                    :class="
                      activeExperience === idx
                        ? 'bg-home-accent/10 dark:bg-blue-500/10 text-home-accent dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                    "
                  >
                    {{ exp.stats }}
                  </span>
                </div>
                <p class="text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">
                  {{ exp.subtitle }}
                </p>

                <div
                  class="overflow-hidden transition-all duration-700 ease-in-out"
                  :style="{
                    maxHeight: activeExperience === idx ? '80px' : '0px',
                    opacity: activeExperience === idx ? 1 : 0
                  }"
                >
                  <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {{ exp.desc }}
                  </p>
                </div>
              </div>

              <div
                class="shrink-0 pt-2 transition-all duration-500"
                :class="
                  activeExperience === idx
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                "
              >
                <div class="i-carbon-chevron-right text-home-accent dark:text-blue-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：视觉展示区 -->
        <div class="lg:col-span-3">
          <div
            class="relative h-full min-h-[450px] md:min-h-[550px] rounded-[40px] overflow-hidden bg-black shadow-2xl group/preview border-8 border-white dark:border-[#121417]"
          >
            <!-- 噪点背景效果 -->
            <div
              class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=film+grain+texture+noise&image_size=square')] bg-repeat"
            />

            <!-- 科技感边角装饰 -->
            <div class="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-white/20" />
            <div class="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-white/20" />
            <div class="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-white/20" />
            <div class="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-white/20" />

            <div
              v-for="(exp, idx) in experiences"
              :key="exp.id"
              class="absolute inset-0 flex flex-col items-center justify-center p-12 transition-all duration-1000 ease-in-out"
              :class="
                activeExperience === idx
                  ? 'opacity-100 scale-100 rotate-0'
                  : 'opacity-0 scale-110 rotate-2 pointer-events-none'
              "
            >
              <div class="relative mb-12">
                <div class="absolute inset-0 bg-white/20 blur-[60px] rounded-full animate-pulse" />
                <div
                  class="relative w-32 h-32 md:w-44 md:h-44 rounded-[40px] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl group-hover/preview:scale-110 transition-transform duration-700"
                >
                  <div
                    :class="[exp.icon, 'text-white text-6xl md:text-8xl filter drop-shadow-2xl']"
                  />
                </div>
              </div>

              <h3 class="text-3xl md:text-5xl font-bold text-white mb-6 text-center tracking-tight">
                {{ exp.title }}
              </h3>
              <p
                class="text-gray-400 text-base md:text-lg text-center max-w-md mb-12 leading-relaxed"
              >
                {{ exp.desc }}
              </p>

              <button
                class="group/btn flex items-center gap-3 px-8 py-3.5 rounded-full bg-white text-black font-bold hover:bg-home-accent hover:text-white transition-all duration-500 shadow-xl shadow-white/10 hover:shadow-home-accent/30"
              >
                <div
                  class="i-carbon-play-filled text-xl group-hover/btn:scale-125 transition-transform"
                />
                立即开启体验
              </button>
            </div>

            <!-- 底部指示器 -->
            <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                v-for="(_, idx) in experiences"
                :key="idx"
                class="h-1.5 rounded-full transition-all duration-500"
                :class="
                  activeExperience === idx ? 'w-12 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'
                "
                @click="setActive(idx)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 1000px;
}
</style>
