<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue';
import { gsap } from 'gsap';
import type { Stat, Skill } from '~/constants/about';

const props = defineProps<{
  stats: Stat[];
  skills: Skill[];
}>();

const statsGroup = useTemplateRef<HTMLDivElement>('statsGroup');
const displayedStats = shallowRef(props.stats.map((stat) => stat.num));
let counterTween: gsap.core.Tween | undefined;
let observer: IntersectionObserver | undefined;
let motionQuery: MediaQueryList | undefined;

/** 以数字区域的实际可见性触发计数，避免上游固定章节改变滚动距离导致提前播放。 */
function setupCounters() {
  counterTween?.kill();
  observer?.disconnect();
  displayedStats.value = props.stats.map((stat) => stat.num);
  if (!statsGroup.value || motionQuery?.matches) return;

  const counters = props.stats.map(() => ({ value: 0 }));
  displayedStats.value = counters.map((counter) => counter.value);
  observer = new IntersectionObserver(
    /** 数字进入阅读区域后错峰递增，每次挂载只播放一次。 */
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35)) {
        return;
      }
      observer?.disconnect();
      counterTween = gsap.to(counters, {
        value: (index: number) => props.stats[index]!.num,
        duration: 2.4,
        stagger: 0.16,
        ease: 'power1.out',
        /** 只更新计数状态，保留单位、标签和无障碍文本的稳定显示。 */
        onUpdate: () => {
          displayedStats.value = counters.map((counter) => Math.round(counter.value));
        }
      });
    },
    { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
  );
  observer.observe(statsGroup.value);
}

/** 在客户端读取动效偏好，服务端及减少动态模式直接显示最终数值。 */
function mountCounters() {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', setupCounters);
  setupCounters();
}

/** 离开页面时释放观察器、动画和偏好监听，防止重复挂载残留计数任务。 */
function disposeCounters() {
  observer?.disconnect();
  counterTween?.kill();
  motionQuery?.removeEventListener('change', setupCounters);
}

onMounted(mountCounters);
onBeforeUnmount(disposeCounters);
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-[6vw] max-w-[1200px] w-full z-10">
    <div>
      <div
        class="font-['Space_Mono',monospace] text-xs tracking-[0.2em] text-purple-600 dark:text-purple-400 mb-6 uppercase"
      >
        02 / 关于我
      </div>

      <h2
        class="font-['Noto_Serif_SC',serif] text-[clamp(3rem,5vw,5rem)] font-black mb-2 bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent"
      >
        入梦
      </h2>

      <p
        class="font-['Space_Mono',monospace] text-sm text-purple-600 dark:text-purple-400 tracking-[0.1em] mb-8"
      >
        全栈开发者 · 创意工程师
      </p>

      <div class="text-black/60 dark:text-white/60 leading-[2] text-[1.1rem] font-light">
        <p>
          热爱将复杂问题简化为优雅方案。在代码与设计的交汇处寻找平衡，相信技术应当服务于人，而非相反。
        </p>
      </div>

      <div ref="statsGroup" class="grid grid-cols-3 md:flex gap-3 md:gap-16 mt-8 md:mt-16">
        <div v-for="(stat, index) in stats" :key="stat.label" class="flex flex-col">
          <div class="flex items-baseline" aria-hidden="true">
            <span
              class="stat-num font-['Space_Mono',monospace] text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-none"
              :style="{ minWidth: `${String(stat.num).length}ch` }"
            >
              {{ displayedStats[index] }}
            </span>
            <span
              class="font-['Space_Mono',monospace] text-lg text-purple-600 dark:text-purple-400 ml-1"
            >
              {{ stat.unit }}
            </span>
          </div>
          <span class="sr-only">{{ stat.num }}{{ stat.unit }}</span>
          <span class="text-xs text-black/50 dark:text-white/50 tracking-[0.1em] mt-2 uppercase">
            {{ stat.label }}
          </span>
        </div>
      </div>
    </div>

    <ul
      aria-label="技术栈"
      class="m-0 p-0 list-none flex flex-wrap gap-2 relative md:block md:h-[400px]"
    >
      <li
        v-for="skill in skills"
        :key="skill.name"
        class="skill-tag px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm"
        :style="{
          '--skill-top': skill.top,
          '--skill-left': skill.left,
          '--skill-size': skill.fontSize
        }"
      >
        {{ skill.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.stat-num {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}

@media (min-width: 768px) {
  .skill-tag {
    position: absolute;
    top: var(--skill-top);
    left: var(--skill-left);
    font-size: var(--skill-size);
  }
}
</style>
