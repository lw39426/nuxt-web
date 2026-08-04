<template>
  <div ref="rootEl" class="root">
    <!-- 粒子背景 -->
    <canvas ref="particleCanvas" class="particle-canvas" />

    <!-- 开场：全屏英雄区 -->
    <section ref="heroScene" class="scene scene-hero">
      <div class="film-grain" />
      <div ref="heroContent" class="hero-content">
        <div ref="chapterLabel" class="chapter-label">第一章</div>
        <h1 ref="heroTitle" class="hero-title">
          <span ref="titleLine1" class="title-line">故事从这里</span>
          <span ref="titleLine2" class="title-line accent">开始</span>
        </h1>
        <p ref="heroSub" class="hero-sub">向下滑动，进入我的世界</p>
        <div ref="scrollIndicator" class="scroll-indicator">
          <div class="scroll-line" />
        </div>
      </div>
      <div ref="heroVisual" class="hero-visual">
        <div class="orbit-ring ring-1" />
        <div class="orbit-ring ring-2" />
        <div class="orbit-ring ring-3" />
        <div ref="avatarCore" class="avatar-core">
          <span>入梦</span>
        </div>
      </div>
    </section>

    <!-- 过渡：电影字幕 -->
    <section ref="transitionScene" class="scene scene-transition">
      <div ref="barTop" class="cinematic-bars top" />
      <div ref="barBottom" class="cinematic-bars bottom" />
      <div ref="transitionText" class="transition-text">
        <span class="quote">"代码是诗，设计是画，</span>
        <span class="quote">我用技术讲述每一个故事。"</span>
      </div>
    </section>

    <!-- 第二章：人物介绍 -->
    <section ref="aboutScene" class="scene scene-about">
      <div class="scene-bg-text">ABOUT</div>
      <div class="about-layout">
        <div ref="aboutLeft" class="about-left">
          <div class="chapter-tag">02 / 关于我</div>
          <h2 ref="aboutName" class="about-name">入梦</h2>
          <p ref="aboutRole" class="about-role">全栈开发者 · 创意工程师</p>
          <div ref="aboutDesc" class="about-desc">
            <p>
              热爱将复杂问题简化为优雅方案。在代码与设计的交汇处寻找平衡，相信技术应当服务于人，而非相反。
            </p>
          </div>
          <div ref="statRow" class="stat-row">
            <div class="stat-item">
              <span class="stat-num" data-count="2">0</span>
              <span class="stat-unit">年</span>
              <span class="stat-label">经验</span>
            </div>
            <div class="stat-item">
              <span class="stat-num" data-count="42">0</span>
              <span class="stat-unit">+</span>
              <span class="stat-label">项目</span>
            </div>
            <div class="stat-item">
              <span class="stat-num" data-count="12">0</span>
              <span class="stat-unit">k</span>
              <span class="stat-label">提交</span>
            </div>
          </div>
        </div>
        <div ref="aboutRight" class="about-right">
          <div class="skill-cloud">
            <div v-for="skill in skills" :key="skill.name" class="skill-tag" :style="skill.style">
              {{ skill.name }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 第三章：时间线经历 -->
    <section ref="timelineScene" class="scene scene-timeline">
      <div class="scene-bg-text">STORY</div>
      <div ref="timelineHeader" class="timeline-header">
        <div class="chapter-tag">03 / 我的旅程</div>
        <h2>每一步都算数</h2>
      </div>
      <div ref="timelineTrack" class="timeline-track">
        <div ref="timelineLine" class="timeline-line" />
        <div
          v-for="(event, i) in timeline"
          :key="i"
          :ref="(el) => (timelineEvents[i] = el)"
          class="timeline-event"
          :class="i % 2 === 0 ? 'event-left' : 'event-right'"
        >
          <div class="event-dot" />
          <div class="event-card">
            <span class="event-year">{{ event.year }}</span>
            <h3 class="event-title">{{ event.title }}</h3>
            <p class="event-desc">{{ event.desc }}</p>
            <span class="event-tag">{{ event.tag }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 第四章：作品展示 -->
    <section ref="worksScene" class="scene scene-works">
      <div class="scene-bg-text">WORKS</div>
      <div ref="worksHeader" class="works-header">
        <div class="chapter-tag">04 / 代表作品</div>
        <h2>用代码构建的世界</h2>
      </div>
      <div ref="worksGrid" class="works-grid">
        <div
          v-for="(work, i) in works"
          :key="i"
          :ref="(el) => (workCards[i] = el)"
          class="work-card"
          :style="{ '--accent': work.color }"
        >
          <div class="work-num">0{{ i + 1 }}</div>
          <div class="work-icon">{{ work.icon }}</div>
          <h3 class="work-title">{{ work.title }}</h3>
          <p class="work-desc">{{ work.desc }}</p>
          <div class="work-tags">
            <span v-for="tag in work.tags" :key="tag" class="work-tag">{{ tag }}</span>
          </div>
          <div class="work-hover-line" />
        </div>
      </div>
    </section>

    <!-- 第五章：联系结尾 -->
    <section ref="contactScene" class="scene scene-contact">
      <div ref="contactInner" class="contact-inner">
        <div class="chapter-tag light">05 / 联系我</div>
        <h2 ref="contactTitle" class="contact-title">让我们一起<br /><em>创造故事</em></h2>
        <p ref="contactSub" class="contact-sub">
          无论是合作项目还是一次简单的对话，我都期待听到你的声音。
        </p>
        <div ref="contactLinks" class="contact-links">
          <a href="mailto:hello@example.com" class="contact-btn">
            <span>发送邮件</span>
            <div class="btn-arrow">→</div>
          </a>
          <a href="https://github.com" class="contact-btn outline">
            <span>GitHub</span>
            <div class="btn-arrow">→</div>
          </a>
        </div>
      </div>
      <div ref="contactCircle" class="contact-bg-circle" />
      <div ref="footerText" class="footer-text">
        <span>© 2025 入梦</span>
        <span class="dot">·</span>
        <span>用 Nuxt + GSAP 构建</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

definePageMeta({
  hideFooter: true
});

// ─── refs ───────────────────────────────────────────────
const rootEl = ref(null);
const particleCanvas = ref(null);
const heroScene = ref(null);
const heroContent = ref(null);
const heroVisual = ref(null);
const heroTitle = ref(null);
const heroSub = ref(null);
const chapterLabel = ref(null);
const titleLine1 = ref(null);
const titleLine2 = ref(null);
const scrollIndicator = ref(null);
const avatarCore = ref(null);
const transitionScene = ref(null);
const transitionText = ref(null);
const barTop = ref(null);
const barBottom = ref(null);
const aboutScene = ref(null);
const aboutLeft = ref(null);
const aboutRight = ref(null);
const aboutName = ref(null);
const aboutRole = ref(null);
const aboutDesc = ref(null);
const statRow = ref(null);
const timelineScene = ref(null);
const timelineHeader = ref(null);
const timelineTrack = ref(null);
const timelineLine = ref(null);
const timelineEvents = ref([]);
const worksScene = ref(null);
const worksHeader = ref(null);
const worksGrid = ref(null);
const workCards = ref([]);
const contactScene = ref(null);
const contactInner = ref(null);
const contactTitle = ref(null);
const contactSub = ref(null);
const contactLinks = ref(null);
const contactCircle = ref(null);
const footerText = ref(null);

// ─── data ────────────────────────────────────────────────
const skills = [
  { name: 'Vue / Nuxt', style: { top: '10%', left: '20%', fontSize: '1.1rem' } },
  { name: 'TypeScript', style: { top: '25%', left: '60%', fontSize: '0.9rem' } },
  { name: 'Node.js', style: { top: '50%', left: '15%', fontSize: '1rem' } },
  { name: 'Python', style: { top: '55%', left: '65%', fontSize: '1.2rem' } },
  { name: 'GSAP', style: { top: '65%', left: '55%', fontSize: '1.2rem' } },
  { name: 'UnoCSS', style: { top: '35%', left: '40%', fontSize: '0.85rem' } },
  { name: 'PostgreSQL', style: { top: '75%', left: '25%', fontSize: '0.9rem' } },
  { name: 'Docker', style: { top: '15%', left: '70%', fontSize: '0.95rem' } },
  { name: 'Three.js', style: { top: '85%', left: '65%', fontSize: '1rem' } }
];

const timeline = [
  {
    year: '2019',
    title: '踏入代码世界',
    desc: '第一次接触 Vue.js，写下人生第一个 Hello World，从此一发不可收拾。',
    tag: '起点'
  },
  {
    year: '2020',
    title: '加入创业团队',
    desc: '作为核心前端工程师，从零构建 SaaS 产品，服务超过 5000 名用户。',
    tag: '成长'
  },
  {
    year: '2021',
    title: '全栈转型',
    desc: '深入 Node.js 与数据库设计，开始承担完整的产品开发周期。',
    tag: '蜕变'
  },
  {
    year: '2023',
    title: '独立开发者',
    desc: '发布首款独立产品，一周内登上 Product Hunt 日榜前十。',
    tag: '里程碑'
  },
  {
    year: '2024',
    title: '开源贡献',
    desc: '核心贡献者加入多个开源项目，累计获得 2k+ GitHub Stars。',
    tag: '回馈'
  }
];

const works = [
  {
    title: 'NarrativeOS',
    desc: '基于 AI 的故事创作平台，支持多人协作实时编辑',
    tags: ['Nuxt', 'AI', 'WebSocket'],
    icon: '◈',
    color: '#c084fc'
  },
  {
    title: 'FlowBoard',
    desc: '可视化任务管理工具，拖拽交互流畅如丝',
    tags: ['Vue', 'GSAP', 'D3'],
    icon: '◉',
    color: '#38bdf8'
  },
  {
    title: 'EchoMetrics',
    desc: '实时数据分析面板，每秒处理万级事件流',
    tags: ['Node', 'ClickHouse', 'WS'],
    icon: '◎',
    color: '#4ade80'
  },
  {
    title: 'PixelForge',
    desc: '浏览器内图像处理引擎，WebAssembly 加速',
    tags: ['WASM', 'Canvas', 'TS'],
    icon: '◆',
    color: '#fb923c'
  }
];

// ─── particles ───────────────────────────────────────────
let animFrame;
function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1
    });
  }

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 180, 255, ${p.o})`;
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

// ─── animations ──────────────────────────────────────────
function setupAnimations() {
  // ── Hero entrance ──
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from(chapterLabel.value, { y: 30, opacity: 0, duration: 0.8 })
    .from(titleLine1.value, { y: 80, opacity: 0, duration: 1 }, '-=0.4')
    .from(titleLine2.value, { y: 80, opacity: 0, duration: 1 }, '-=0.7')
    .from(heroSub.value, { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
    .from(scrollIndicator.value, { opacity: 0, duration: 0.5 }, '-=0.3')
    .from(
      '.orbit-ring',
      { scale: 0, opacity: 0, stagger: 0.15, duration: 1, ease: 'back.out(1.5)' },
      '-=1'
    )
    .from(avatarCore.value, { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, '-=0.6');

  // ── Hero parallax on scroll ──
  gsap.to(heroContent.value, {
    y: -150,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: heroScene.value, start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to(heroVisual.value, {
    y: -80,
    rotate: 45,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: heroScene.value, start: 'top top', end: 'bottom top', scrub: true }
  });

  // ── Transition scene ──
  const transTl = gsap.timeline({
    scrollTrigger: {
      trigger: transitionScene.value,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 0.5
    }
  });
  transTl
    .from(barTop.value, { y: '-100%', duration: 1 })
    .from(barBottom.value, { y: '100%', duration: 1 }, '<')
    .from('.quote', { y: 40, opacity: 0, stagger: 0.3, duration: 0.8 }, '-=0.5');

  // ── About scene ──
  gsap.from(aboutLeft.value, {
    x: -80,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: aboutScene.value,
      start: 'top 60%',
      toggleActions: 'play none none reverse'
    }
  });
  gsap.from(aboutRight.value, {
    x: 80,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: aboutScene.value,
      start: 'top 60%',
      toggleActions: 'play none none reverse'
    }
  });
  gsap.from('.skill-tag', {
    y: 30,
    opacity: 0,
    stagger: 0.08,
    duration: 0.6,
    ease: 'back.out(1.5)',
    scrollTrigger: {
      trigger: aboutScene.value,
      start: 'top 50%',
      toggleActions: 'play none none reverse'
    }
  });

  // Count up stats
  ScrollTrigger.create({
    trigger: statRow.value,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      document.querySelectorAll('.stat-num').forEach((el) => {
        const target = +el.dataset.count;
        gsap.to(
          { val: 0 },
          {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(this.targets()[0].val);
            }
          }
        );
      });
    }
  });

  // ── Timeline ──
  gsap.from(timelineHeader.value, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    scrollTrigger: { trigger: timelineScene.value, start: 'top 70%' }
  });
  gsap.from(timelineLine.value, {
    scaleY: 0,
    transformOrigin: 'top center',
    duration: 1.5,
    ease: 'power2.out',
    scrollTrigger: { trigger: timelineTrack.value, start: 'top 70%', end: 'bottom 30%', scrub: 0.5 }
  });
  timelineEvents.value.forEach((el, i) => {
    if (!el) return;
    gsap.from(el, {
      x: i % 2 === 0 ? -80 : 80,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none reverse' }
    });
  });

  // ── Works ──
  gsap.from(worksHeader.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    scrollTrigger: { trigger: worksScene.value, start: 'top 70%' }
  });
  workCards.value.forEach((el, i) => {
    if (!el) return;
    gsap.from(el, {
      y: 80,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: worksGrid.value,
        start: 'top 65%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // ── Contact ──
  gsap.from(contactCircle.value, {
    scale: 0,
    opacity: 0,
    duration: 1.5,
    ease: 'power3.out',
    scrollTrigger: { trigger: contactScene.value, start: 'top 70%' }
  });
  const contactTl = gsap.timeline({
    scrollTrigger: {
      trigger: contactScene.value,
      start: 'top 65%',
      toggleActions: 'play none none reverse'
    }
  });
  contactTl
    .from(contactTitle.value, { y: 60, opacity: 0, duration: 0.9 })
    .from(contactSub.value, { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
    .from('.contact-btn', { y: 20, opacity: 0, stagger: 0.15, duration: 0.6 }, '-=0.3')
    .from(footerText.value, { opacity: 0, duration: 0.5 }, '-=0.2');
}

onMounted(() => {
  // 仅在客户端注册 GSAP 插件（避免 SSR/水合不匹配）
  gsap.registerPlugin(ScrollTrigger);

  initParticles(particleCanvas.value);
  setupAnimations();
});

onUnmounted(() => {
  ScrollTrigger.killAll();
  cancelAnimationFrame(animFrame);
});
</script>

<style scoped>
/* ─── font import ──────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Space+Mono:wght@400;700&family=Noto+Sans+SC:wght@300;400;500&display=swap');

/* ─── reset / root ─────────────────────────────────────── */
.root {
  background: #08070f;
  color: #e8e0ff;
  font-family: 'Noto Sans SC', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* ─── particle canvas ──────────────────────────────────── */
.particle-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

/* ─── film grain overlay ────────────────────────────────── */
.film-grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  animation: grain 0.5s steps(1) infinite;
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

/* ─── shared scene ──────────────────────────────────────── */
.scene {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 4rem;
  box-sizing: border-box;
}

.chapter-tag {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: #a78bfa;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}
.chapter-tag.light {
  color: #ede9fe;
}

.scene-bg-text {
  position: absolute;
  font-family: 'Space Mono', monospace;
  font-size: clamp(5rem, 15vw, 14rem);
  font-weight: 700;
  color: rgba(167, 139, 250, 0.04);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: 0.1em;
}

/* ─── HERO ──────────────────────────────────────────────── */
.scene-hero {
  gap: 6rem;
  flex-direction: row;
  overflow: hidden;
  padding-top: 0;
}

.hero-content {
  flex: 1;
  max-width: 560px;
}

.chapter-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  color: #a78bfa;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.chapter-label::after {
  content: '';
  display: block;
  width: 3rem;
  height: 1px;
  background: #a78bfa;
}

.hero-title {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(3.5rem, 7vw, 6rem);
  font-weight: 900;
  line-height: 1.1;
  margin: 0 0 1.5rem;
  display: flex;
  flex-direction: column;
}
.title-line {
  display: block;
}
.title-line.accent {
  background: linear-gradient(135deg, #a78bfa, #c084fc, #e879f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: 1rem;
  color: rgba(232, 224, 255, 0.5);
  letter-spacing: 0.05em;
  margin: 0 0 3rem;
}

.scroll-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: rgba(232, 224, 255, 0.3);
}
.scroll-line {
  width: 2rem;
  height: 1px;
  background: rgba(232, 224, 255, 0.3);
  position: relative;
  overflow: hidden;
}
.scroll-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: #a78bfa;
  animation: scan 2s ease-in-out infinite;
}
@keyframes scan {
  to {
    left: 100%;
  }
}

/* ─── hero visual ───────────────────────────────────────── */
.hero-visual {
  flex: 0 0 auto;
  width: 360px;
  height: 360px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbit-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(167, 139, 250, 0.2);
}
.ring-1 {
  width: 200px;
  height: 200px;
  animation: spin 20s linear infinite;
  border-top-color: rgba(167, 139, 250, 0.6);
}
.ring-2 {
  width: 280px;
  height: 280px;
  animation: spin 30s linear infinite reverse;
  border-left-color: rgba(192, 132, 252, 0.5);
}
.ring-3 {
  width: 360px;
  height: 360px;
  animation: spin 45s linear infinite;
  border-bottom-color: rgba(232, 121, 249, 0.3);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.avatar-core {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7, #d946ef);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Serif SC', serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 0 60px rgba(139, 92, 246, 0.5);
}

/* ─── TRANSITION ────────────────────────────────────────── */
.scene-transition {
  flex-direction: column;
  min-height: 50vh;
  background: #0d0b1a;
  overflow: hidden;
}

.cinematic-bars {
  position: absolute;
  left: 0;
  right: 0;
  height: 80px;
  background: #08070f;
}
.cinematic-bars.top {
  top: 0;
}
.cinematic-bars.bottom {
  bottom: 0;
}

.transition-text {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.quote {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(1.2rem, 3vw, 2rem);
  font-weight: 400;
  color: rgba(232, 224, 255, 0.7);
  letter-spacing: 0.05em;
}

/* ─── ABOUT ─────────────────────────────────────────────── */
.scene-about {
  background: #0a091a;
  gap: 0;
  padding: 8rem 4rem;
}
.about-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  width: 100%;
  max-width: 1100px;
}

.about-name {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(3rem, 5vw, 4.5rem);
  font-weight: 900;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #e8e0ff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.about-role {
  font-family: 'Space Mono', monospace;
  font-size: 0.85rem;
  color: #a78bfa;
  letter-spacing: 0.1em;
  margin: 0 0 2rem;
}
.about-desc p {
  color: rgba(232, 224, 255, 0.6);
  line-height: 1.9;
  font-size: 1rem;
  font-weight: 300;
}

.stat-row {
  display: flex;
  gap: 3rem;
  margin-top: 3rem;
}
.stat-item {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  flex-wrap: wrap;
}
.stat-num {
  font-family: 'Space Mono', monospace;
  font-size: 2.8rem;
  font-weight: 700;
  color: #a78bfa;
  line-height: 1;
}
.stat-unit {
  font-family: 'Space Mono', monospace;
  font-size: 1.2rem;
  color: #a78bfa;
}
.stat-label {
  display: block;
  width: 100%;
  font-size: 0.75rem;
  color: rgba(232, 224, 255, 0.4);
  letter-spacing: 0.1em;
  margin-top: 0.25rem;
}

.about-right {
  position: relative;
}
.skill-cloud {
  position: relative;
  height: 320px;
}
.skill-tag {
  position: absolute;
  padding: 0.4rem 1rem;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 2rem;
  font-size: 0.85rem;
  color: rgba(232, 224, 255, 0.8);
  background: rgba(167, 139, 250, 0.05);
  white-space: nowrap;
  transition: all 0.3s;
  cursor: default;
}
.skill-tag:hover {
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.15);
  color: #e8e0ff;
  transform: translateY(-3px);
}

/* ─── TIMELINE ──────────────────────────────────────────── */
.scene-timeline {
  flex-direction: column;
  padding: 8rem 4rem;
  background: #08070f;
  gap: 4rem;
}
.timeline-header {
  text-align: center;
}
.timeline-header h2 {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  margin: 0;
}

.timeline-track {
  position: relative;
  width: 100%;
  max-width: 900px;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #a78bfa 10%, #a78bfa 90%, transparent);
  transform: translateX(-50%);
}

.timeline-event {
  display: flex;
  margin-bottom: 4rem;
  position: relative;
  width: 50%;
}
.timeline-event.event-left {
  padding-right: 4rem;
  justify-content: flex-end;
  align-self: flex-start;
}
.timeline-event.event-right {
  padding-left: 4rem;
  margin-left: 50%;
  align-self: flex-start;
}

.event-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #a78bfa;
  box-shadow: 0 0 20px rgba(167, 139, 250, 0.8);
  top: 1.5rem;
}
.event-left .event-dot {
  right: calc(4rem - 6px);
  transform: translateX(50%);
}
.event-right .event-dot {
  left: calc(4rem - 6px);
  transform: translateX(-50%);
}

.event-card {
  background: rgba(167, 139, 250, 0.05);
  border: 1px solid rgba(167, 139, 250, 0.15);
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 340px;
  transition: border-color 0.3s;
}
.event-card:hover {
  border-color: rgba(167, 139, 250, 0.4);
}
.event-year {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: #a78bfa;
  letter-spacing: 0.15em;
}
.event-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0.5rem 0;
  color: #e8e0ff;
}
.event-desc {
  font-size: 0.9rem;
  color: rgba(232, 224, 255, 0.55);
  line-height: 1.7;
  margin: 0 0 1rem;
  font-weight: 300;
}
.event-tag {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 1rem;
  font-size: 0.7rem;
  color: #a78bfa;
  letter-spacing: 0.1em;
}

/* ─── WORKS ─────────────────────────────────────────────── */
.scene-works {
  flex-direction: column;
  padding: 8rem 4rem;
  background: #0a091a;
  gap: 4rem;
}
.works-header {
  text-align: center;
}
.works-header h2 {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  margin: 0;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 900px;
}

.work-card {
  position: relative;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.25rem;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    border-color 0.3s;
  cursor: pointer;
}
.work-card:hover {
  transform: translateY(-6px);
  border-color: var(--accent, #a78bfa);
}
.work-card:hover .work-hover-line {
  transform: scaleX(1);
}

.work-num {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: rgba(232, 224, 255, 0.25);
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
}
.work-icon {
  font-size: 2rem;
  color: var(--accent, #a78bfa);
  margin-bottom: 1rem;
  display: block;
}
.work-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: #e8e0ff;
}
.work-desc {
  font-size: 0.875rem;
  color: rgba(232, 224, 255, 0.5);
  line-height: 1.7;
  margin: 0 0 1.25rem;
  font-weight: 300;
}
.work-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.work-tag {
  padding: 0.2rem 0.7rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-family: 'Space Mono', monospace;
  color: rgba(232, 224, 255, 0.4);
}
.work-hover-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent, #a78bfa);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

/* ─── CONTACT ───────────────────────────────────────────── */
.scene-contact {
  flex-direction: column;
  min-height: 100vh;
  background: #06050e;
  position: relative;
  overflow: hidden;
  justify-content: center;
  gap: 0;
}

.contact-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.contact-title {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(3rem, 6vw, 5.5rem);
  font-weight: 900;
  line-height: 1.2;
  margin: 0 0 1.5rem;
  color: #e8e0ff;
}
.contact-title em {
  font-style: normal;
  background: linear-gradient(135deg, #a78bfa, #e879f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.contact-sub {
  font-size: 1rem;
  color: rgba(232, 224, 255, 0.5);
  max-width: 480px;
  line-height: 1.8;
  margin: 0 0 3rem;
  font-weight: 300;
}

.contact-links {
  display: flex;
  gap: 1.5rem;
}
.contact-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 2rem;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border-radius: 3rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
  letter-spacing: 0.03em;
}
.contact-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.4);
}
.contact-btn.outline {
  background: transparent;
  border: 1px solid rgba(167, 139, 250, 0.4);
  color: rgba(232, 224, 255, 0.8);
}
.contact-btn.outline:hover {
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.08);
  box-shadow: none;
}

.btn-arrow {
  font-size: 1rem;
  transition: transform 0.3s;
}
.contact-btn:hover .btn-arrow {
  transform: translateX(4px);
}

.contact-bg-circle {
  position: absolute;
  width: 700px;
  height: 700px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.12), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.footer-text {
  position: absolute;
  bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: rgba(232, 224, 255, 0.25);
  letter-spacing: 0.1em;
}
.dot {
  color: rgba(167, 139, 250, 0.4);
}

/* ─── responsive ────────────────────────────────────────── */
@media (max-width: 768px) {
  .scene-hero {
    flex-direction: column;
    gap: 3rem;
    padding: 4rem 2rem;
  }
  .hero-visual {
    width: 200px;
    height: 200px;
  }
  .ring-3 {
    width: 200px;
    height: 200px;
  }
  .ring-2 {
    width: 160px;
    height: 160px;
  }
  .ring-1 {
    width: 120px;
    height: 120px;
  }
  .about-layout {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .works-grid {
    grid-template-columns: 1fr;
  }
  .scene {
    padding: 4rem 1.5rem;
  }
  .timeline-event.event-right {
    margin-left: 0;
    padding-left: 3rem;
  }
  .timeline-event.event-left {
    padding-right: 3rem;
  }
  .contact-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>
