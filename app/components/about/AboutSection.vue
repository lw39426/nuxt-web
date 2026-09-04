<script setup lang="ts">
import type { Stat, Skill } from '~/constants/about';

defineProps<{
  stats: Stat[];
  skills: Skill[];
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-[6vw] max-w-[1200px] w-full z-10">
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

      <div class="flex gap-8 md:gap-16 mt-16">
        <div v-for="(stat, i) in stats" :key="i" class="flex flex-col">
          <div class="flex items-baseline">
            <span
              class="stat-num font-['Space_Mono',monospace] text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-none"
              :data-count="stat.num"
            >
              0
            </span>
            <span
              class="font-['Space_Mono',monospace] text-lg text-purple-600 dark:text-purple-400 ml-1"
            >
              {{ stat.unit }}
            </span>
          </div>
          <span class="text-xs text-black/50 dark:text-white/50 tracking-[0.1em] mt-2 uppercase">
            {{ stat.label }}
          </span>
        </div>
      </div>
    </div>

    <div class="relative h-[400px]">
      <div
        v-for="skill in skills"
        :key="skill.name"
        class="skill-tag absolute px-4 py-2 rounded-full text-sm text-gray-800 dark:text-gray-200 cursor-default bg-white/70 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm transition-all duration-300 hover:border-purple-500 dark:hover:border-purple-400 hover:-translate-y-1 hover:scale-105"
        :style="{ top: skill.top, left: skill.left, fontSize: skill.fontSize }"
      >
        {{ skill.name }}
      </div>
    </div>
  </div>
</template>
