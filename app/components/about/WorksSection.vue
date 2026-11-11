<script setup lang="ts">
import type { Work } from '~/constants/about';

defineProps<{
  works: Work[];
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 w-full max-w-[1000px] z-10">
    <article
      v-for="(work, i) in works"
      :key="i"
      class="relative p-4 md:p-12 rounded-3xl overflow-hidden bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm"
      :style="{ '--card-accent': work.color }"
    >
      <div
        class="hidden md:block font-['Space_Mono',monospace] text-xs text-black/40 dark:text-white/40 tracking-[0.2em] mb-6"
      >
        0{{ i + 1 }}
      </div>

      <div class="flex items-center gap-3 md:block">
        <span
          class="text-2xl md:text-4xl md:block md:mb-6 text-[var(--card-accent)]"
          aria-hidden="true"
        >
          {{ work.icon }}
        </span>
        <h3
          class="font-['Noto_Serif_SC',serif] text-xl md:text-2xl font-bold md:mb-4 text-gray-900 dark:text-white"
        >
          {{ work.title }}
        </h3>
      </div>

      <p
        class="text-[0.95rem] text-black/60 dark:text-white/60 leading-[1.8] mt-2 md:mt-0 mb-3 md:mb-8 font-light"
      >
        {{ work.desc }}
      </p>

      <div class="flex flex-wrap gap-2 md:gap-3">
        <span
          v-for="tag in work.tags"
          :key="tag"
          class="px-3 py-1 rounded-lg text-xs font-['Space_Mono',monospace] text-black/60 dark:text-white/60 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10"
        >
          {{ tag }}
        </span>
      </div>
    </article>
  </div>
</template>
