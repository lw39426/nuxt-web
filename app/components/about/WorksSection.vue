<script setup lang="ts">
import type { Work } from '~/constants/about';

defineProps<{
  works: Work[];
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1000px] z-10">
    <div
      v-for="(work, i) in works"
      :key="i"
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
      />
    </div>
  </div>
</template>
