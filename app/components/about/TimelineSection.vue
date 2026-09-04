<script setup lang="ts">
import type { TimelineEvent } from '~/constants/about';

defineProps<{
  events: TimelineEvent[];
}>();
</script>

<template>
  <div class="relative w-full max-w-[1000px] pl-8 md:pl-0">
    <!-- 中心线 -->
    <div
      class="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-purple-500/50 dark:via-purple-500/80 to-transparent md:-translate-x-1/2 origin-top timeline-line"
    />

    <div
      v-for="(event, i) in events"
      :key="i"
      class="relative flex w-full md:w-1/2 mb-16 md:mb-24 timeline-event"
      :class="
        i % 2 === 0
          ? 'md:justify-end md:pr-16 pl-12 pr-2 md:pl-0'
          : 'md:ml-[50%] md:pl-16 pl-12 pr-2'
      "
    >
      <!-- 节点圆圈 -->
      <div
        class="absolute w-4 h-4 rounded-full bg-[#f4f4f6] dark:bg-[#050508] border-4 border-purple-500 dark:border-purple-400 top-8 z-10 transition-all duration-300 timeline-dot"
        :class="i % 2 === 0 ? 'left-[10px] md:left-auto md:right-[-8px]' : 'left-[10px]'"
      />

      <!-- 卡片 -->
      <div
        class="w-full max-w-[400px] p-6 md:p-8 rounded-3xl cursor-default bg-white/78 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm transition-all duration-400 hover:border-purple-500 dark:hover:border-purple-400 hover:-translate-y-1"
      >
        <span
          class="font-['Space_Mono',monospace] text-[0.85rem] text-purple-600 dark:text-purple-400 tracking-[0.15em]"
        >
          {{ event.year }}
        </span>
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
</template>

<style scoped>
.timeline-event:hover .timeline-dot {
  transform: scale(1.3);
  background: rgb(168 85 247);
  box-shadow: 0 0 20px rgb(168 85 247);
}
</style>
