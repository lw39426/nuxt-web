<template>
  <!-- 根节点：绑定 dark 类以激活 UnoCSS 的暗黑模式，并加入全局渐变过渡 -->
  <div
    ref="rootEl"
    class="relative overflow-x-hidden transition-colors duration-800 ease-out font-sans bg-[#f4f4f6] text-[#111] dark:bg-[#050508] dark:text-[#f8f9fa]"
    :class="{ dark: isDark }"
  >
    <!-- 粒子背景 -->
    <canvas ref="particleCanvas" class="fixed inset-0 pointer-events-none z-0" />
    <!-- 噪点胶片质感 (保留在style中因为SVG过长) -->
    <div class="film-grain" />

    <!-- 主题切换按钮 -->
    <button
      class="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg bg-white/70 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10"
      @click="toggleTheme"
    >
      <div
        class="w-5 h-5 rounded-full bg-transparent transition-all duration-500 ease-out shadow-[inset_-6px_-4px_0_0_#111] dark:shadow-[inset_-6px_-4px_0_0_#fff]"
        :class="{ 'scale-80 shadow-[inset_-20px_-20px_0_0_#111]': !isDark }"
      ></div>
    </button>

    <!-- 第一章：全屏英雄区 -->
    <section
      ref="heroScene"
      class="relative z-10 h-screen flex flex-col md:flex-row items-center justify-center px-8 gap-12 md:gap-[6vw] box-border overflow-hidden bg-[linear-gradient(180deg,rgba(244,244,246,0.96)_0%,rgba(244,244,246,0.84)_100%)] dark:bg-[linear-gradient(180deg,#050508_0%,#08080e_55%,#050508_100%)]"
    >
      <div
        class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.10),transparent_38%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.46),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.16),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.10),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]"
      ></div>
      <div ref="heroContent" class="flex-1 max-w-[600px] z-10 text-center md:text-left">
        <div
          ref="chapterLabel"
          class="font-['Space_Mono',monospace] text-xs tracking-[0.2em] text-purple-600 dark:text-purple-400 mb-8 uppercase flex items-center justify-center md:justify-start gap-4"
        >
          第一章 <span class="block w-12 h-px bg-purple-600 dark:bg-purple-400"></span>
        </div>
        <h1
          ref="heroTitle"
          class="font-['Noto_Serif_SC',serif] text-[clamp(3.5rem,7vw,6.5rem)] font-black leading-[1.1] tracking-tight mb-6 flex flex-col"
        >
          <span ref="titleLine1" class="block text-black/80 dark:text-gray-200">故事从这里</span>
          <span
            ref="titleLine2"
            class="block bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent"
            >开始</span
          >
        </h1>
        <p
          ref="heroSub"
          class="text-[1.1rem] text-black/60 dark:text-white/60 tracking-[0.05em] mb-12 font-light"
        >
          向下滑动，进入我的世界
        </p>
        <div
          ref="scrollIndicator"
          class="flex items-center justify-center md:justify-start gap-4 font-['Space_Mono',monospace] text-xs tracking-[0.15em] text-black/40 dark:text-white/40"
        >
          Scroll
          <div class="w-12 h-px bg-black/10 dark:bg-white/10 relative overflow-hidden">
            <div
              class="scroll-line absolute top-0 left-[-100%] w-full h-full bg-purple-600 dark:bg-purple-400"
            ></div>
          </div>
        </div>
      </div>

      <div
        ref="heroVisual"
        class="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center"
      >
        <div
          class="orbit-ring absolute rounded-full border border-purple-500/20 dark:border-purple-400/30 w-[220px] h-[220px] border-t-purple-600 dark:border-t-purple-400 animate-spin-slow"
        ></div>
        <div
          class="orbit-ring absolute rounded-full border border-pink-500/20 dark:border-fuchsia-400/30 w-[320px] h-[320px] border-l-pink-600 dark:border-l-fuchsia-400 animate-spin-reverse"
        ></div>
        <div
          class="orbit-ring absolute rounded-full border border-purple-500/10 dark:border-purple-400/10 w-[420px] h-[420px] animate-spin-slower"
        ></div>

        <div
          ref="avatarCore"
          class="w-[120px] h-[120px] rounded-full flex items-center justify-center font-['Noto_Serif_SC',serif] text-4xl font-bold text-gray-900 dark:text-gray-50 shadow-[0_0_60px_rgba(168,85,247,0.16)] bg-white/75 dark:bg-[#0f0f14]/90 backdrop-blur-md border border-black/5 dark:border-white/10 transition-colors duration-400"
        >
          入梦
        </div>
      </div>
    </section>

    <!-- 过渡：电影字幕 -->
    <section
      ref="transitionScene"
      class="relative z-10 flex flex-col items-center justify-center h-screen bg-[linear-gradient(180deg,rgba(244,244,246,0.94)_0%,rgba(235,238,243,0.96)_48%,rgba(244,244,246,0.92)_100%)] dark:bg-[linear-gradient(180deg,#050508_0%,#090a10_48%,#050508_100%)] transition-colors duration-800"
    >
      <div
        class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.75),rgba(255,255,255,0)_58%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),rgba(255,255,255,0)_60%)]"
      ></div>
      <div
        ref="barTop"
        class="absolute top-0 left-0 right-0 h-[110px] bg-gradient-to-b from-white/90 via-white/70 to-transparent dark:from-[#050508] dark:via-[#050508] dark:to-transparent transition-colors duration-800"
      ></div>
      <div
        ref="barBottom"
        class="absolute bottom-0 left-0 right-0 h-[110px] bg-gradient-to-t from-white/90 via-white/70 to-transparent dark:from-[#050508] dark:via-[#050508] dark:to-transparent transition-colors duration-800"
      ></div>
      <div ref="transitionText" class="text-center flex flex-col gap-3 z-10">
        <span
          class="quote block font-['Noto_Serif_SC',serif] text-[clamp(1.4rem,2.8vw,2.35rem)] leading-[1.35] text-gray-900 dark:text-gray-100 tracking-[0.05em]"
          >"代码是诗，设计是画"</span
        >
        <span
          class="quote font-['Noto_Serif_SC',serif] text-[clamp(1.5rem,3vw,2.5rem)] text-gray-900 dark:text-gray-100 tracking-[0.05em]"
          >我用技术讲述每一个故事</span
        >
      </div>
    </section>

    <!-- 第二章：人物介绍 -->
    <section
      ref="aboutScene"
      class="relative z-10 min-h-screen flex items-center justify-center px-8 py-24 box-border bg-white dark:bg-[#08080c] transition-colors duration-800 overflow-hidden"
    >
      <div
        class="absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none tracking-wider transition-colors duration-800"
      >
        ABOUT
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-[6vw] max-w-[1200px] w-full z-10">
        <div ref="aboutLeft">
          <div
            class="font-['Space_Mono',monospace] text-xs tracking-[0.2em] text-purple-600 dark:text-purple-400 mb-6 uppercase"
          >
            02 / 关于我
          </div>
          <h2
            ref="aboutName"
            class="font-['Noto_Serif_SC',serif] text-[clamp(3rem,5vw,5rem)] font-black mb-2 bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent"
          >
            入梦
          </h2>
          <p
            ref="aboutRole"
            class="font-['Space_Mono',monospace] text-sm text-purple-600 dark:text-purple-400 tracking-[0.1em] mb-8"
          >
            全栈开发者 · 创意工程师
          </p>
          <div
            ref="aboutDesc"
            class="text-black/60 dark:text-white/60 leading-[2] text-[1.1rem] font-light"
          >
            <p>
              热爱将复杂问题简化为优雅方案。在代码与设计的交汇处寻找平衡，相信技术应当服务于人，而非相反。
            </p>
          </div>
          <div ref="statRow" class="flex gap-8 md:gap-16 mt-16">
            <div v-for="(stat, index) in stats" :key="index" class="flex flex-col">
              <div class="flex items-baseline">
                <span
                  class="stat-num font-['Space_Mono',monospace] text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-none"
                  :data-count="stat.num"
                  >0</span
                >
                <span
                  class="font-['Space_Mono',monospace] text-lg text-purple-600 dark:text-purple-400 ml-1"
                  >{{ stat.unit }}</span
                >
              </div>
              <span
                class="text-xs text-black/50 dark:text-white/50 tracking-[0.1em] mt-2 uppercase"
                >{{ stat.label }}</span
              >
            </div>
          </div>
        </div>

        <div ref="aboutRight" class="relative h-[400px]">
          <div
            v-for="skill in skills"
            :key="skill.name"
            class="skill-tag absolute px-4 py-2 rounded-full text-sm text-gray-800 dark:text-gray-200 cursor-default bg-white/70 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm transition-all duration-300 hover:border-purple-500 dark:hover:border-purple-400 hover:-translate-y-1 hover:scale-105"
            :style="skill.style"
          >
            {{ skill.name }}
          </div>
        </div>
      </div>
    </section>

    <!-- 第三章：时间线经历 -->
    <section
      ref="timelineScene"
      class="relative z-10 min-h-screen flex flex-col items-center py-24 md:py-32 px-4 box-border overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,244,246,0.94)_18%,rgba(238,240,245,0.98)_100%)] dark:bg-[linear-gradient(180deg,#050508_0%,#070710_35%,#050508_100%)]"
    >
      <div
        class="absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-[30%] left-1/2 -translate-x-1/2 pointer-events-none tracking-wider transition-colors duration-800"
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

      <div ref="timelineTrack" class="relative w-full max-w-[1000px] pl-8 md:pl-0 ml-0 md:ml-0">
        <!-- 中心线 -->
        <div
          ref="timelineLine"
          class="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-purple-500/50 dark:via-purple-500/80 to-transparent md:-translate-x-1/2 origin-top"
        ></div>

        <div
          v-for="(event, i) in timeline"
          :key="i"
          :ref="(el) => (timelineEvents[i] = el)"
          class="relative flex w-full md:w-1/2 mb-16 md:mb-24 timeline-event"
          :class="
            i % 2 === 0
              ? 'md:justify-end md:pr-16 pl-12 pr-2 md:pl-0'
              : 'md:ml-[50%] md:pl-16 pl-12 pr-2'
          "
        >
          <!-- 节点圆圈 -->
          <div
            class="absolute w-4 h-4 rounded-full bg-[#f4f4f6] dark:bg-[#050508] border-4 border-purple-500 dark:border-purple-400 top-8 z-10 transition-all duration-300"
            :class="i % 2 === 0 ? 'left-[10px] md:left-auto md:right-[-8px]' : 'left-[10px]'"
          ></div>

          <!-- 卡片 -->
          <div
            class="w-full max-w-[400px] p-6 md:p-8 rounded-3xl cursor-default bg-white/78 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm transition-all duration-400 hover:border-purple-500 dark:hover:border-purple-400 hover:-translate-y-1"
          >
            <span
              class="font-['Space_Mono',monospace] text-[0.85rem] text-purple-600 dark:text-purple-400 tracking-[0.15em]"
              >{{ event.year }}</span
            >
            <h3
              class="font-['Noto_Serif_SC',serif] text-xl font-bold my-3 text-gray-900 dark:text-gray-100"
            >
              {{ event.title }}
            </h3>
            <p class="text-black/60 dark:text-white/60 leading-[1.8] text-[1rem] font-light mb-6">
              {{ event.desc }}
            </p>
            <span
              class="inline-block px-4 py-1 rounded-full text-xs font-['Space_Mono',monospace] text-gray-700 dark:text-gray-300 tracking-[0.1em] border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5"
            >
              {{ event.tag }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 第四章：作品展示 -->
    <section
      ref="worksScene"
      class="relative z-10 min-h-screen flex flex-col items-center py-32 px-8 box-border bg-white dark:bg-[#08080c] transition-colors duration-800 overflow-hidden"
    >
      <div
        class="absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none tracking-wider transition-colors duration-800"
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

      <div ref="worksGrid" class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1000px] z-10">
        <div
          v-for="(work, i) in works"
          :key="i"
          :ref="(el) => (workCards[i] = el)"
          class="group relative p-8 md:p-12 rounded-3xl overflow-hidden cursor-pointer bg-white/70 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm transition-all duration-400 hover:-translate-y-2 hover:shadow-xl"
          :style="{ '--card-accent': work.color }"
        >
          <div
            class="font-['Space_Mono',monospace] text-xs text-black/40 dark:text-white/40 tracking-[0.2em] mb-6"
          >
            0{{ i + 1 }}
          </div>
          <div class="text-4xl mb-6 text-[var(--card-accent)]">{{ work.icon }}</div>
          <h3
            class="font-['Noto_Serif_SC',serif] text-2xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {{ work.title }}
          </h3>
          <p class="text-[0.95rem] text-black/60 dark:text-white/60 leading-[1.8] mb-8 font-light">
            {{ work.desc }}
          </p>
          <div class="flex flex-wrap gap-3">
            <span
              v-for="tag in work.tags"
              :key="tag"
              class="px-3 py-1 rounded-lg text-xs font-['Space_Mono',monospace] text-black/60 dark:text-white/60 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10"
            >
              {{ tag }}
            </span>
          </div>
          <!-- 底部高亮滑块 -->
          <div
            class="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--card-accent)] scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"
          ></div>
        </div>
      </div>
    </section>

    <!-- 第五章：联系结尾 -->
    <section
      ref="contactScene"
      class="relative z-10 h-screen flex flex-col items-center justify-center overflow-hidden border-black/5 dark:border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,244,246,0.95)_45%,rgba(236,239,244,0.98)_100%)] dark:bg-[linear-gradient(180deg,#050508_0%,#090910_55%,#050508_100%)]"
    >
      <!-- 背景神秘光晕 -->
      <div
        class="absolute w-[700px] h-[700px] rounded-full pointer-events-none z-0 bg-radial-gradient from-purple-500/20 dark:from-purple-500/30 to-transparent"
      ></div>

      <div
        ref="contactInner"
        class="relative z-10 flex flex-col items-center text-center px-6 py-12 md:px-10 md:py-16 max-w-[min(900px,calc(100%-2rem))]"
      >
        <div
          class="font-['Space_Mono',monospace] text-xs tracking-[0.2em] text-purple-600 dark:text-purple-400 mb-6 uppercase"
        >
          05 / 联系我
        </div>
        <h2
          ref="contactTitle"
          class="font-['Noto_Serif_SC',serif] text-[clamp(3.5rem,6vw,6rem)] font-black leading-[1.2] mb-8 text-gray-900 dark:text-white"
        >
          让我们一起<br />
          <span
            class="bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent"
            >创造故事</span
          >
        </h2>
        <p
          ref="contactSub"
          class="text-[1.1rem] text-black/60 dark:text-white/60 max-w-[500px] leading-[1.8] font-light mb-16"
        >
          无论是合作项目还是一次简单的对话，我都期待听到你的声音。
        </p>
      </div>

      <div
        ref="footerText"
        class="absolute bottom-8 flex items-center gap-4 font-['Space_Mono',monospace] text-xs text-black/40 dark:text-white/40 tracking-[0.1em] z-10"
      >
        <span>© 2025 入梦</span>
        <span class="text-purple-600 dark:text-purple-400">·</span>
        <span>Crafted with Nuxt & GSAP</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

definePageMeta({ hideFooter: true });

// 主题状态 — 使用 @nuxtjs/color-mode（由 @nuxt/ui 自动安装）
const colorMode = useColorMode();
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v) => {
    colorMode.preference = v ? 'dark' : 'light';
  }
});
const toggleTheme = () => {
  isDark.value = !isDark.value;
};

// 引用
const rootEl = ref(null);
const particleCanvas = ref(null);
const heroScene = ref(null),
  heroContent = ref(null),
  heroVisual = ref(null);
const heroTitle = ref(null),
  heroSub = ref(null),
  chapterLabel = ref(null);
const titleLine1 = ref(null),
  titleLine2 = ref(null),
  scrollIndicator = ref(null);
const avatarCore = ref(null),
  transitionScene = ref(null),
  transitionText = ref(null);
const barTop = ref(null),
  barBottom = ref(null),
  aboutScene = ref(null);
const aboutLeft = ref(null),
  aboutRight = ref(null),
  aboutName = ref(null);
const aboutRole = ref(null),
  aboutDesc = ref(null),
  statRow = ref(null);
const timelineScene = ref(null),
  timelineHeader = ref(null),
  timelineTrack = ref(null);
const timelineLine = ref(null),
  timelineEvents = ref([]);
const worksScene = ref(null),
  worksHeader = ref(null),
  worksGrid = ref(null),
  workCards = ref([]);
const contactScene = ref(null),
  contactInner = ref(null),
  contactTitle = ref(null);
const contactSub = ref(null),
  // contactCircle = ref(null),
  footerText = ref(null);

// 数据
const stats = [
  { num: 2, unit: '年', label: '经验' },
  { num: 42, unit: '+', label: '项目' },
  { num: 12, unit: 'k', label: '提交' }
];

const skills = [
  { name: 'Vue / Nuxt', style: { top: '10%', left: '20%', fontSize: '1.1rem' } },
  { name: 'TypeScript', style: { top: '25%', left: '60%', fontSize: '0.9rem' } },
  { name: 'Node.js', style: { top: '50%', left: '15%', fontSize: '1rem' } },
  { name: 'Python', style: { top: '55%', left: '65%', fontSize: '1.2rem' } },
  { name: 'GSAP', style: { top: '65%', left: '55%', fontSize: '1.2rem' } },
  { name: 'Three.js', style: { top: '85%', left: '65%', fontSize: '1rem' } }
];

const timeline = [
  {
    year: '2019',
    title: '踏入代码世界',
    desc: '第一次接触 Vue.js，写下人生第一个 Hello World。',
    tag: '起点'
  },
  {
    year: '2021',
    title: '全栈转型',
    desc: '深入 Node.js 与数据库设计，开始承担完整的产品周期。',
    tag: '蜕变'
  },
  {
    year: '2023',
    title: '独立开发者',
    desc: '发布首款独立产品，一周内登上 Product Hunt 日榜前十。',
    tag: '里程碑'
  }
];

const works = [
  {
    title: 'NarrativeOS',
    desc: '基于 AI 的故事创作平台',
    tags: ['Nuxt', 'AI'],
    icon: '◈',
    color: '#c084fc'
  },
  {
    title: 'FlowBoard',
    desc: '可视化任务管理工具',
    tags: ['Vue', 'GSAP'],
    icon: '◉',
    color: '#38bdf8'
  },
  {
    title: 'EchoMetrics',
    desc: '实时数据分析面板',
    tags: ['Node', 'WS'],
    icon: '◎',
    color: '#4ade80'
  },
  {
    title: 'PixelForge',
    desc: '浏览器内图像处理引擎',
    tags: ['WASM', 'Canvas'],
    icon: '◆',
    color: '#fb923c'
  }
];

// 粒子系统逻辑
let animFrame;
function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 50 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5
  }));

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 颜色随主题变化
    ctx.fillStyle = isDark.value ? 'rgba(167, 139, 250, 0.4)' : 'rgba(100, 116, 139, 0.3)';
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    animFrame = requestAnimationFrame(draw);
  };
  draw();
}

let ctx; // GSAP Context

onMounted(() => {
  // 仅在客户端注册 GSAP 插件（避免 SSR/水合不匹配）
  gsap.registerPlugin(ScrollTrigger);

  initParticles(particleCanvas.value);

  // 使用 GSAP Context 管理内存
  ctx = gsap.context(() => {
    const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    heroTl
      .from(chapterLabel.value, { y: 30, opacity: 0, duration: 1 })
      .from(titleLine1.value, { y: 80, opacity: 0, duration: 1.2 }, '-=0.6')
      .from(titleLine2.value, { y: 80, opacity: 0, duration: 1.2 }, '-=1')
      .from(heroSub.value, { y: 20, opacity: 0, duration: 1 }, '-=0.8')
      .from(scrollIndicator.value, { opacity: 0, duration: 1 }, '-=0.5')
      .from(
        '.orbit-ring',
        { scale: 0, opacity: 0, stagger: 0.15, duration: 1.5, ease: 'back.out(1.2)' },
        '-=1.5'
      )
      .from(avatarCore.value, { scale: 0, opacity: 0, duration: 1, ease: 'back.out(1.5)' }, '-=1');

    gsap.to(heroContent.value, {
      y: -100,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: heroScene.value, start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to(heroVisual.value, {
      y: -50,
      rotate: 15,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: heroScene.value, start: 'top top', end: 'bottom top', scrub: true }
    });

    const transTl = gsap.timeline({
      scrollTrigger: {
        trigger: transitionScene.value,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1
      }
    });
    transTl
      .from(barTop.value, { y: '-70%', duration: 1 })
      .from(barBottom.value, { y: '100%', duration: 1 }, '<')
      .from('.quote', { y: 40, opacity: 0, stagger: 0.3, duration: 0.8 }, '<');

    gsap.from(aboutLeft.value, {
      x: -50,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: aboutScene.value, start: 'top 60%' }
    });
    gsap.from(aboutRight.value, {
      x: 50,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: aboutScene.value, start: 'top 60%' }
    });
    gsap.from('.skill-tag', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'back.out(1.5)',
      scrollTrigger: { trigger: aboutScene.value, start: 'top 50%' }
    });

    ScrollTrigger.create({
      trigger: statRow.value,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        document.querySelectorAll('.stat-num').forEach((el) => {
          gsap.to(
            { val: 0 },
            {
              val: +el.dataset.count,
              duration: 2.5,
              ease: 'expo.out',
              onUpdate: function () {
                el.textContent = Math.round(this.targets()[0].val);
              }
            }
          );
        });
      }
    });

    gsap.from(timelineHeader.value, {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: { trigger: timelineScene.value, start: 'top 70%' }
    });
    gsap.from(timelineLine.value, {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: 1.5,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: timelineTrack.value, start: 'top 60%', end: 'bottom 40%', scrub: 1 }
    });
    timelineEvents.value.forEach((el, i) => {
      gsap.from(el, {
        x: i % 2 === 0 ? -50 : 50,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });

    gsap.from(worksHeader.value, {
      y: 40,
      opacity: 0,
      duration: 1,
      scrollTrigger: { trigger: worksScene.value, start: 'top 70%' }
    });
    workCards.value.forEach((el, i) => {
      gsap.from(el, {
        y: 60,
        opacity: 0,
        duration: 1,
        delay: i * 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: worksGrid.value, start: 'top 65%' }
      });
    });

    // gsap.from(contactCircle.value, {
    //   scale: 0,
    //   opacity: 0,
    //   duration: 2,
    //   ease: 'expo.out',
    //   scrollTrigger: { trigger: contactScene.value, start: 'top 70%' }
    // });
    gsap.from(contactTitle.value, {
      y: 60,
      opacity: 0,
      duration: 1,
      scrollTrigger: { trigger: contactScene.value, start: 'top 65%' }
    });
    gsap.from(contactSub.value, {
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      scrollTrigger: { trigger: contactScene.value, start: 'top 65%' }
    });
    gsap.from('.contact-btn', {
      y: 20,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      delay: 0.4,
      scrollTrigger: { trigger: contactScene.value, start: 'top 65%' }
    });
  }, rootEl.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert(); // 极其重要：清理动画防止内存泄漏
  cancelAnimationFrame(animFrame);
});
</script>

<!-- CSS 精简到了极致，只保留 UnoCSS 难以直接复现的复杂动画和特殊 SVG 滤镜 -->
<style scoped>
/* 引入必需的高级字体 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Space+Mono:wght@400;700&family=Noto+Sans+SC:wght@300;400;500&display=swap');

/* 噪点特效，使用混合模式 */
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

/* UnoCSS 支持 animate-spin，但我们需要自定义速度和方向 */
.animate-spin-slow {
  animation: spin 25s linear infinite;
}
.animate-spin-reverse {
  animation: spin 35s linear infinite reverse;
}
.animate-spin-slower {
  animation: spin 50s linear infinite;
}

/* Timeline 节点 Hover 穿透控制 */
.timeline-event:hover > div:first-child {
  transform: scale(1.3);
  background: rgb(168 85 247);
  box-shadow: 0 0 20px rgb(168 85 247);
}

/* 简单的滚动提示线与噪点关键帧 */
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

/* 自定义径向渐变工具类补充 */
.bg-radial-gradient {
  background-image: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to) 70%);
}
</style>
