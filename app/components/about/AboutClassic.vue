<script setup lang="ts">
import { computed, ref } from 'vue';
import { useContactInkCanvas } from '~/composables/useContactInkCanvas';
import { useHeroPointerEffects } from '~/composables/useHeroPointerEffects';
import { useParticleCanvas } from '~/composables/useParticleCanvas';
import { useScrollAnimations } from '~/composables/useScrollAnimations';
import { stats, skills, timeline, works } from '~/constants/about';
import AboutSection from '~/components/about/AboutSection.vue';
import HeroKitten from '~/components/about/HeroKitten.vue';
import StorySection from '~/components/about/StorySection.vue';
import TimelineSection from '~/components/about/TimelineSection.vue';
import WorksSection from '~/components/about/WorksSection.vue';

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
const heroPointerCanvas = ref<HTMLCanvasElement | null>(null);
const contactInkCanvas = ref<HTMLCanvasElement | null>(null);

// 动画 Refs（传递给 composable）
const heroScene = ref<HTMLElement | null>(null);
const heroContent = ref<HTMLElement | null>(null);
const heroVisual = ref<HTMLElement | null>(null);
const chapterLabel = ref<HTMLElement | null>(null);
const titleLine1 = ref<HTMLElement | null>(null);
const titleLine2 = ref<HTMLElement | null>(null);
const heroSub = ref<HTMLElement | null>(null);
const scrollIndicator = ref<HTMLElement | null>(null);
const heroCharacter = ref<HTMLElement | null>(null);
const transitionScene = ref<HTMLElement | null>(null);
const barTop = ref<HTMLElement | null>(null);
const barBottom = ref<HTMLElement | null>(null);
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

// 电影字幕按热爱、探索、创造、向前递进，静态文案无需额外响应式状态。
const transitionChapters = [
  {
    number: '01',
    title: '热爱，让故事开始',
    lines: ['代码是诗，设计是画。', '我用技术讲述每一个故事。'],
    description: '从一份好奇出发，把心中的想法，一点点变成看得见、用得上的美好。'
  },
  {
    number: '02',
    title: '探索，让可能发生',
    lines: ['每一次探索，都让视野更开阔。', '每一次尝试，都让想法更靠近现实。'],
    description: '保持学习，认真动手。把新的发现带进实践，让今天的自己比昨天更进一步。'
  },
  {
    number: '03',
    title: '创造，让技术有温度',
    lines: ['让复杂变得清晰，', '让体验多一分温度。'],
    description: '以代码打磨细节，以设计理解需求，让每一次创造都为使用的人带来便利。'
  },
  {
    number: '04',
    title: '向前，让故事继续',
    lines: ['带着热爱，继续向前。', '下一个好故事，正在路上。'],
    description: '把积累变成新的起点，也期待与你一起，让更多值得的想法成为真实的作品。'
  }
];

// 粒子系统
const particle = useParticleCanvas(particleCanvas);
const heroPointer = useHeroPointerEffects(heroPointerCanvas, () => isDark.value);
const contactInk = useContactInkCanvas(
  contactInkCanvas,
  /** 让局部水墨随当前主题调整对比度，不改变正文层级。 */
  () => isDark.value
);

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
      heroCharacter,
      transitionScene,
      barTop,
      barBottom,
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
      @pointermove="heroPointer.move"
      @pointerleave="heroPointer.leave"
      @pointercancel="heroPointer.leave"
    >
      <!-- 背景渐变 -->
      <div class="hero-bg absolute inset-0 pointer-events-none" aria-hidden="true" />
      <canvas
        ref="heroPointerCanvas"
        class="hero-pointer-canvas absolute inset-0 z-[1] h-full w-full pointer-events-none"
        aria-hidden="true"
      />

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

      <!-- 实时三维小猫：入场、滚动与关节转向分别作用于独立层。 -->
      <div
        ref="heroVisual"
        class="hero-visual relative z-10 shrink-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
        @pointerenter="heroPointer.burst"
      >
        <div ref="heroCharacter" class="h-full w-full">
          <HeroKitten :pointer-target="heroScene" :dark="isDark" />
        </div>
      </div>
    </section>

    <!-- 第二章过渡：四段电影字幕序幕 -->
    <section
      ref="transitionScene"
      class="transition-section relative z-10"
      aria-labelledby="transition-heading"
    >
      <h2 id="transition-heading" class="sr-only">让热爱成为作品</h2>
      <div class="transition-bg absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div
        ref="barTop"
        class="transition-bar-top absolute top-0 left-0 right-0 h-[110px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        ref="barBottom"
        class="transition-bar-bottom absolute bottom-0 left-0 right-0 h-[110px] pointer-events-none"
        aria-hidden="true"
      />

      <div class="transition-text relative z-10">
        <article
          v-for="chapter in transitionChapters"
          :key="chapter.number"
          class="transition-chapter text-center"
          :aria-labelledby="`transition-chapter-${chapter.number}`"
        >
          <h3
            :id="`transition-chapter-${chapter.number}`"
            class="transition-subtitle transition-chapter-title text-purple-600 dark:text-purple-400"
          >
            <span class="font-['Space_Mono',monospace]">序幕 / {{ chapter.number }}</span>
            <span class="w-6 h-px bg-purple-600/30 dark:bg-purple-400/40" aria-hidden="true" />
            <span>{{ chapter.title }}</span>
          </h3>
          <p class="transition-quote font-['Noto_Serif_SC',serif] text-gray-900 dark:text-gray-100">
            <span v-for="line in chapter.lines" :key="line" class="transition-subtitle block">
              {{ line }}
            </span>
          </p>
          <p class="transition-subtitle transition-description text-black/60 dark:text-white/60">
            {{ chapter.description }}
          </p>
        </article>
      </div>

      <div
        class="transition-progress absolute bottom-16 left-1/2 -translate-x-1/2 w-40 h-px bg-black/10 dark:bg-white/10"
        aria-hidden="true"
      >
        <span
          class="block w-full h-full origin-left bg-gradient-to-r from-purple-500 to-pink-500"
        />
      </div>
    </section>

    <!-- 第三章：人物介绍 -->
    <section
      class="relative z-10 md:min-h-screen flex items-center justify-center px-5 md:px-8 pt-14 pb-18 md:py-24 box-border bg-white dark:bg-[#08080c] transition-colors duration-800 overflow-hidden"
    >
      <div
        class="about-watermark absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none tracking-wider"
        aria-hidden="true"
      >
        ABOUT
      </div>

      <AboutSection :stats="stats" :skills="skills" />
    </section>

    <!-- 第四章：人物三个切面 -->
    <StorySection />

    <!-- 第五章：时间线经历 -->
    <section
      ref="timelineScene"
      class="relative z-10 md:min-h-screen flex flex-col items-center py-14 md:py-32 px-4 box-border overflow-hidden"
    >
      <div
        class="timeline-watermark absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-[30%] left-1/2 -translate-x-1/2 pointer-events-none tracking-wider"
        aria-hidden="true"
      >
        STORY
      </div>

      <div ref="timelineHeader" class="text-center z-10 mb-8 md:mb-20">
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

    <!-- 第六章：作品展示 -->
    <section
      ref="worksScene"
      class="relative z-10 md:min-h-screen flex flex-col items-center py-14 md:py-32 px-5 md:px-8 box-border bg-white dark:bg-[#08080c] transition-colors duration-800 overflow-hidden"
    >
      <div
        class="works-watermark absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none tracking-wider"
        aria-hidden="true"
      >
        WORKS
      </div>

      <div ref="worksHeader" class="text-center z-10 mb-8 md:mb-16">
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

    <!-- 第七章：联系结尾 -->
    <section
      ref="contactScene"
      class="contact-scene relative z-10 h-screen flex flex-col items-center justify-center overflow-hidden"
      @pointerenter="contactInk.enter"
      @pointermove="contactInk.move"
      @pointerleave="contactInk.leave"
      @pointercancel="contactInk.leave"
    >
      <div
        class="contact-glow absolute w-[700px] h-[700px] rounded-full pointer-events-none z-0 bg-radial-gradient from-purple-500/20 dark:from-purple-500/30 to-transparent"
        aria-hidden="true"
      />
      <canvas
        ref="contactInkCanvas"
        class="contact-ink-canvas absolute inset-0 z-[1] h-full w-full pointer-events-none"
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
          class="contact-title font-['Noto_Serif_SC',serif] text-[clamp(3.5rem,6vw,6rem)] font-black leading-[1.2] mb-8 text-gray-900 dark:text-white"
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
          class="text-[1.1rem] text-black/60 dark:text-white/60 max-w-[500px] leading-[1.8] font-light md:mb-16"
        >
          期待听到来自你的声音
        </p>
      </div>

      <footer
        class="contact-footer md:absolute md:bottom-8 flex items-center font-['Space_Mono',monospace] text-xs text-black/55 dark:text-white/55 tracking-[0.1em] z-10"
      >
        <span>© 2025 入梦</span>
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

@media (width < 768px) {
  .hero {
    height: auto;
    min-height: calc(100svh - 70px);
    gap: clamp(18px, 4svh, 32px);
    padding: 28px 20px calc(76px + env(safe-area-inset-bottom));
  }

  .hero-content {
    flex: none;
  }

  .chapter-label,
  .hero-title {
    margin-bottom: 16px;
  }

  .hero-title {
    font-size: clamp(2.5rem, 12vw, 3.5rem);
  }

  .hero-sub {
    margin-bottom: 18px;
    font-size: 1rem;
  }

  .hero-visual {
    width: clamp(168px, 54vw, 244px);
    height: auto;
    aspect-ratio: 1;
  }

  .contact-scene {
    height: auto;
    min-height: 70svh;
    gap: 28px;
    padding: 64px 20px calc(84px + env(safe-area-inset-bottom));
  }

  .contact-inner {
    max-width: 100%;
    padding: 0;
  }

  .contact-title {
    margin-bottom: 16px;
    font-size: clamp(2.25rem, 10vw, 3.25rem);
    word-break: keep-all;
  }
}

/* 过渡区域默认自然展开，固定动效启用时切换为重叠字幕。 */
.transition-section {
  box-sizing: border-box;
  padding: clamp(88px, 12vh, 144px) clamp(24px, 5vw, 72px);
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

.transition-text {
  display: grid;
  gap: clamp(72px, 12vh, 128px);
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

.transition-chapter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 32px 0;
}

.transition-chapter + .transition-chapter {
  border-top: 1px solid rgba(147, 51, 234, 0.12);
  padding-top: clamp(72px, 10vh, 112px);
}
.dark .transition-chapter + .transition-chapter {
  border-color: rgba(192, 132, 252, 0.14);
}

.transition-chapter-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 28px;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.8;
  letter-spacing: 0.12em;
}

.transition-quote {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  font-size: clamp(1.35rem, 2.8vw, 2.5rem);
  line-height: 1.65;
  letter-spacing: 0.04em;
  text-wrap: balance;
}

.transition-description {
  width: 100%;
  max-width: 34rem;
  margin: 28px 0 0;
  font-size: clamp(0.9rem, 1.2vw, 1rem);
  line-height: 1.95;
  letter-spacing: 0.04em;
  text-wrap: pretty;
}

.transition-progress {
  display: none;
}

.transition-section[data-layout='cinema'] {
  display: flex;
  align-items: center;
  min-height: 100vh;
  min-height: 100svh;
}

.transition-section[data-layout='cinema'] .transition-text {
  gap: 0;
}

.transition-section[data-layout='cinema'] .transition-chapter {
  grid-area: 1 / 1;
  border: 0;
  padding: 48px 0;
}

.transition-section[data-layout='cinema'] .transition-progress {
  display: block;
}

@media (width < 900px) {
  .transition-section[data-layout='cinema'] .transition-progress {
    inset-inline: 0;
    bottom: calc(92px + env(safe-area-inset-bottom));
    margin-inline: auto;
    transform: none;
    translate: none;
  }
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
  .scroll-line,
  .film-grain {
    animation: none;
  }
}
</style>
