<script setup lang="ts">
import { computed, ref } from 'vue';
import { useParticleCanvas } from '~/composables/useParticleCanvas';
import { useScrollAnimations } from '~/composables/useScrollAnimations';
import { stats, skills, timeline, works } from '~/constants/about';
import AboutSection from '~/components/about/AboutSection.vue';
import TimelineSection from '~/components/about/TimelineSection.vue';
import WorksSection from '~/components/about/WorksSection.vue';

definePageMeta({ hideFooter: true });

/**
 * 关于页 SEO 元信息
 * - 覆盖全站默认 description，介绍站点定位与团队
 */
useSeoMeta({
  title: '关于我们',
  description:
    '了解 YouMi 角色百科的定位与理念 —— 一个由爱好者维护的角色图鉴平台，致力于让每一个角色都值得被认真看见。'
});

// 主题
const colorMode = useColorMode();
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v: boolean) => {
    colorMode.preference = v ? 'dark' : 'light';
  }
});
const toggleTheme = () => {
  isDark.value = !isDark.value;
};

// Refs
const rootEl = ref<HTMLElement | null>(null);
const particleCanvas = ref<HTMLCanvasElement | null>(null);

// 动画 Refs（传递给 composable）
const heroScene = ref<HTMLElement | null>(null);
const heroContent = ref<HTMLElement | null>(null);
const heroVisual = ref<HTMLElement | null>(null);
const chapterLabel = ref<HTMLElement | null>(null);
const titleLine1 = ref<HTMLElement | null>(null);
const titleLine2 = ref<HTMLElement | null>(null);
const heroSub = ref<HTMLElement | null>(null);
const scrollIndicator = ref<HTMLElement | null>(null);
const avatarCore = ref<HTMLElement | null>(null);
const transitionScene = ref<HTMLElement | null>(null);
const barTop = ref<HTMLElement | null>(null);
const barBottom = ref<HTMLElement | null>(null);
const aboutScene = ref<HTMLElement | null>(null);
const aboutLeft = ref<HTMLElement | null>(null);
const aboutRight = ref<HTMLElement | null>(null);
const statRow = ref<HTMLElement | null>(null);
const timelineScene = ref<HTMLElement | null>(null);
const timelineHeader = ref<HTMLElement | null>(null);
const timelineTrack = ref<HTMLElement | null>(null);
const timelineLine = ref<HTMLElement | null>(null);
const timelineEvents = ref<(HTMLElement | null)[]>([]);
const worksScene = ref<HTMLElement | null>(null);
const worksHeader = ref<HTMLElement | null>(null);
const worksGrid = ref<HTMLElement | null>(null);
const workCards = ref<(HTMLElement | null)[]>([]);
const contactScene = ref<HTMLElement | null>(null);
const contactTitle = ref<HTMLElement | null>(null);
const contactSub = ref<HTMLElement | null>(null);

// 粒子系统
const particle = useParticleCanvas(particleCanvas);

// 滚动动画
const animations = useScrollAnimations();

onMounted(() => {
  if (particleCanvas.value) {
    particle.init(particleCanvas.value, () => isDark.value);
  }

  if (rootEl.value) {
    animations.init(rootEl.value, {
      heroScene,
      heroContent,
      heroVisual,
      chapterLabel,
      titleLine1,
      titleLine2,
      heroSub,
      scrollIndicator,
      avatarCore,
      transitionScene,
      barTop,
      barBottom,
      aboutScene,
      aboutLeft,
      aboutRight,
      statRow,
      timelineScene,
      timelineHeader,
      timelineTrack,
      timelineLine,
      timelineEvents,
      worksScene,
      worksHeader,
      worksGrid,
      workCards,
      contactScene,
      contactTitle,
      contactSub
    });
  }
});

onUnmounted(() => {
  particle.destroy();
  animations.revert();
});
</script>

<template>
  <div
    ref="rootEl"
    class="relative overflow-x-hidden transition-colors duration-800 ease-out font-sans bg-[#f4f4f6] text-[#111] dark:bg-[#050508] dark:text-[#f8f9fa]"
    :class="{ dark: isDark }"
  >
    <!-- 粒子背景 -->
    <canvas ref="particleCanvas" class="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />

    <!-- 噪点胶片质感 -->
    <div class="film-grain" aria-hidden="true" />

    <!-- 主题切换按钮 -->
    <button
      class="theme-toggle fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg bg-white/70 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10"
      :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
      @click="toggleTheme"
    >
      <div
        class="theme-icon w-5 h-5 rounded-full bg-transparent transition-all duration-500 ease-out shadow-[inset_-6px_-4px_0_0_#111] dark:shadow-[inset_-6px_-4px_0_0_#fff]"
        :class="{ 'scale-80 shadow-[inset_-20px_-20px_0_0_#111]': !isDark }"
      />
    </button>

    <!-- 第一章：全屏英雄区 -->
    <section
      ref="heroScene"
      class="hero relative z-10 h-screen flex flex-col md:flex-row items-center justify-center px-8 gap-12 md:gap-[6vw] box-border overflow-hidden"
    >
      <!-- 背景渐变 -->
      <div class="hero-bg absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div
        ref="heroContent"
        class="hero-content flex-1 max-w-[600px] z-10 text-center md:text-left"
      >
        <div ref="chapterLabel" class="chapter-label">
          第一章 <span class="chapter-line block w-12 h-px bg-purple-600 dark:bg-purple-400" />
        </div>

        <h1
          class="hero-title font-['Noto_Serif_SC',serif] text-[clamp(3.5rem,7vw,6.5rem)] font-black leading-[1.1] tracking-tight mb-6 flex flex-col"
        >
          <span ref="titleLine1" class="block text-black/80 dark:text-gray-200">故事从这里</span>
          <span
            ref="titleLine2"
            class="block bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent"
          >
            开始
          </span>
        </h1>

        <p
          ref="heroSub"
          class="hero-sub text-[1.1rem] text-black/60 dark:text-white/60 tracking-[0.05em] mb-12 font-light"
        >
          向下滑动，进入我的世界
        </p>

        <div
          ref="scrollIndicator"
          class="scroll-hint flex items-center justify-center md:justify-start gap-4 font-['Space_Mono',monospace] text-xs tracking-[0.15em] text-black/40 dark:text-white/40"
        >
          Scroll
          <div
            class="scroll-line-container w-12 h-px bg-black/10 dark:bg-white/10 relative overflow-hidden"
          >
            <div
              class="scroll-line absolute top-0 left-[-100%] w-full h-full bg-purple-600 dark:bg-purple-400"
            />
          </div>
        </div>
      </div>

      <!-- 视觉元素 -->
      <div
        ref="heroVisual"
        class="hero-visual relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center"
      >
        <div class="orbit-ring animate-spin-slow absolute w-[220px] h-[220px]" />
        <div class="orbit-ring animate-spin-reverse absolute w-[320px] h-[320px]" />
        <div class="orbit-ring animate-spin-slower absolute w-[420px] h-[420px]" />

        <div
          ref="avatarCore"
          class="avatar-core w-[120px] h-[120px] rounded-full flex items-center justify-center font-['Noto_Serif_SC',serif] text-4xl font-bold text-gray-900 dark:text-gray-50"
        >
          入梦
        </div>
      </div>
    </section>

    <!-- 过渡：电影字幕 -->
    <section
      ref="transitionScene"
      class="transition-section relative z-10 flex flex-col items-center justify-center h-screen"
    >
      <div class="transition-bg absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div ref="barTop" class="transition-bar-top absolute top-0 left-0 right-0 h-[110px]" />
      <div
        ref="barBottom"
        class="transition-bar-bottom absolute bottom-0 left-0 right-0 h-[110px]"
      />

      <div class="transition-text text-center flex flex-col gap-3 z-10">
        <span
          class="quote block font-['Noto_Serif_SC',serif] text-[clamp(1.4rem,2.8vw,2.35rem)] leading-[1.35] text-gray-900 dark:text-gray-100 tracking-[0.05em]"
        >
          "代码是诗，设计是画"
        </span>
        <span
          class="quote font-['Noto_Serif_SC',serif] text-[clamp(1.5rem,3vw,2.5rem)] text-gray-900 dark:text-gray-100 tracking-[0.05em]"
        >
          我用技术讲述每一个故事
        </span>
      </div>
    </section>

    <!-- 第二章：人物介绍 -->
    <section
      ref="aboutScene"
      class="relative z-10 min-h-screen flex items-center justify-center px-8 py-24 box-border bg-white dark:bg-[#08080c] transition-colors duration-800 overflow-hidden"
    >
      <div
        class="about-watermark absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none tracking-wider"
        aria-hidden="true"
      >
        ABOUT
      </div>

      <AboutSection :stats="stats" :skills="skills" />
    </section>

    <!-- 第三章：时间线经历 -->
    <section
      ref="timelineScene"
      class="relative z-10 min-h-screen flex flex-col items-center py-24 md:py-32 px-4 box-border overflow-hidden"
    >
      <div
        class="timeline-watermark absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-[30%] left-1/2 -translate-x-1/2 pointer-events-none tracking-wider"
        aria-hidden="true"
      >
        STORY
      </div>

      <div ref="timelineHeader" class="text-center z-10 mb-20">
        <div
          class="font-['Space_Mono',monospace] text-xs tracking-[0.2em] text-purple-600 dark:text-purple-400 mb-4 uppercase"
        >
          03 / 我的旅程
        </div>
        <h2
          class="font-['Noto_Serif_SC',serif] text-[clamp(2.5rem,4vw,4rem)] font-bold m-0 text-gray-900 dark:text-white"
        >
          每一步都算数
        </h2>
      </div>

      <TimelineSection :events="timeline" />
    </section>

    <!-- 第四章：作品展示 -->
    <section
      ref="worksScene"
      class="relative z-10 min-h-screen flex flex-col items-center py-32 px-8 box-border bg-white dark:bg-[#08080c] transition-colors duration-800 overflow-hidden"
    >
      <div
        class="works-watermark absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none tracking-wider"
        aria-hidden="true"
      >
        WORKS
      </div>

      <div ref="worksHeader" class="text-center z-10 mb-16">
        <div
          class="font-['Space_Mono',monospace] text-xs tracking-[0.2em] text-purple-600 dark:text-purple-400 mb-4 uppercase"
        >
          04 / 代表作品
        </div>
        <h2
          class="font-['Noto_Serif_SC',serif] text-[clamp(2.5rem,4vw,4rem)] font-bold m-0 text-gray-900 dark:text-white"
        >
          用代码构建的世界
        </h2>
      </div>

      <WorksSection ref="worksGrid" :works="works" />
    </section>

    <!-- 第五章：联系结尾 -->
    <section
      ref="contactScene"
      class="relative z-10 h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <div
        class="contact-glow absolute w-[700px] h-[700px] rounded-full pointer-events-none z-0 bg-radial-gradient from-purple-500/20 dark:from-purple-500/30 to-transparent"
        aria-hidden="true"
      />

      <div
        class="contact-inner relative z-10 flex flex-col items-center text-center px-6 py-12 md:px-10 md:py-16 max-w-[min(900px,calc(100%-2rem))]"
      >
        <!-- <div
          class="font-['Space_Mono',monospace] text-xs tracking-[0.2em] text-purple-600 dark:text-purple-400 mb-6 uppercase"
        >
          05 / 联系我
        </div> -->

        <h2
          ref="contactTitle"
          class="font-['Noto_Serif_SC',serif] text-[clamp(3.5rem,6vw,6rem)] font-black leading-[1.2] mb-8 text-gray-900 dark:text-white"
        >
          让我们一起<br />
          <span
            class="bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent"
          >
            创造故事
          </span>
        </h2>

        <p
          ref="contactSub"
          class="text-[1.1rem] text-black/60 dark:text-white/60 max-w-[500px] leading-[1.8] font-light mb-16"
        >
          期待听到来自你的声音
        </p>
      </div>

      <footer
        class="absolute bottom-8 flex items-center gap-4 font-['Space_Mono',monospace] text-xs text-black/40 dark:text-white/40 tracking-[0.1em] z-10"
      >
        <span>© 2025 入梦</span>
        <span class="text-purple-600 dark:text-purple-400">·</span>
        <span></span>
      </footer>
    </section>
  </div>
</template>

<style scoped>
/* Hero 区域 */
.hero {
  background: linear-gradient(180deg, rgba(244, 244, 246, 0.96) 0%, rgba(244, 244, 246, 0.84) 100%);
}
.dark .hero {
  background: linear-gradient(180deg, #050508 0%, #08080e 55%, #050508 100%);
}

.hero-bg {
  background:
    radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.1), transparent 38%),
    radial-gradient(circle at 80% 30%, rgba(236, 72, 153, 0.08), transparent 35%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0));
}
.dark .hero-bg {
  background:
    radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.16), transparent 35%),
    radial-gradient(circle at 80% 30%, rgba(236, 72, 153, 0.1), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0));
}

.chapter-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: rgb(147 51 234);
  margin-bottom: 2rem;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (min-width: 768px) {
  .chapter-label {
    justify-content: flex-start;
  }
}
.dark .chapter-label {
  color: rgb(192 132 252);
}

.hero-sub {
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: 0.05em;
  margin-bottom: 3rem;
  font-weight: 300;
}
.dark .hero-sub {
  color: rgba(255, 255, 255, 0.6);
}

/* 轨道环 */
.orbit-ring {
  border-radius: 9999px;
  border: 1px solid rgba(168, 85, 247, 0.2);
}
.dark .orbit-ring {
  border-color: rgba(192, 132, 252, 0.3);
}
.orbit-ring:first-child {
  border-top-color: rgb(147 51 234);
}
.dark .orbit-ring:first-child {
  border-top-color: rgb(192 132 252);
}
.orbit-ring:nth-child(2) {
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-left-color: rgb(219 39 119);
}
.dark .orbit-ring:nth-child(2) {
  border-color: rgba(244 114 182, 0.3);
  border-left-color: rgb(244 114 182);
}
.orbit-ring:nth-child(3) {
  border-color: rgba(168, 85, 247, 0.1);
}
.dark .orbit-ring:nth-child(3) {
  border-color: rgba(192, 132, 252, 0.1);
}

.avatar-core {
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 0 60px rgba(168, 85, 247, 0.16);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: color 400ms;
}
.dark .avatar-core {
  background: rgba(15, 15, 20, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

/* 过渡区域 */
.transition-section {
  background: linear-gradient(
    180deg,
    rgba(244, 244, 246, 0.94) 0%,
    rgba(235, 238, 243, 0.96) 48%,
    rgba(244, 244, 246, 0.92) 100%
  );
  transition: color 800ms;
}
.dark .transition-section {
  background: linear-gradient(180deg, #050508 0%, #090a10 48%, #050508 100%);
}

.transition-bg {
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.75),
    rgba(255, 255, 255, 0) 58%
  );
}
.dark .transition-bg {
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0) 60%
  );
}

.transition-bar-top {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.7),
    transparent
  );
  transition: color 800ms;
}
.dark .transition-bar-top {
  background: linear-gradient(to bottom, #050508, #050508, transparent);
}

.transition-bar-bottom {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.7),
    transparent
  );
  transition: color 800ms;
}
.dark .transition-bar-bottom {
  background: linear-gradient(to top, #050508, #050508, transparent);
}

/* Timeline 区域 */
.timeline-section-bg {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(244, 244, 246, 0.94) 18%,
    rgba(238, 240, 245, 0.98) 100%
  );
}
.dark .timeline-section-bg {
  background: linear-gradient(180deg, #050508 0%, #070710 35%, #050508 100%);
}

/* 联系区域 */
.contact-section-bg {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(244, 244, 246, 0.95) 45%,
    rgba(236, 239, 244, 0.98) 100%
  );
}
.dark .contact-section-bg {
  background: linear-gradient(180deg, #050508 0%, #090910 55%, #050508 100%);
}

/* 噪点特效 */
.film-grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.04;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  animation: grain 0.5s steps(1) infinite;
}

/* 动画 */
.animate-spin-slow {
  animation: spin 25s linear infinite;
}
.animate-spin-reverse {
  animation: spin 35s linear infinite reverse;
}
.animate-spin-slower {
  animation: spin 50s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes scan {
  to {
    left: 100%;
  }
}
.scroll-line {
  animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes grain {
  0%,
  100% {
    transform: translate(0, 0);
  }
  10% {
    transform: translate(-2%, -3%);
  }
  30% {
    transform: translate(3%, 2%);
  }
  50% {
    transform: translate(-1%, 4%);
  }
  70% {
    transform: translate(4%, -1%);
  }
  90% {
    transform: translate(-3%, 1%);
  }
}

/* 径向渐变工具类 */
.bg-radial-gradient {
  background-image: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to) 70%);
}

/* 无障碍：尊重用户的减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .animate-spin-slow,
  .animate-spin-reverse,
  .animate-spin-slower,
  .scroll-line,
  .film-grain {
    animation: none;
  }
}
</style>
