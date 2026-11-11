<template>
  <!-- overflow-hidden：裁剪装饰光晕，避免移动端被撑出横向滚动 -->
  <div class="bg-canvas-elevated pt-5 md:pt-10 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-wrap justify-between items-baseline gap-x-3 gap-y-1 pb-4 md:pb-8">
        <div class="relative">
          <div
            class="absolute -top-14 -left-10 w-72 h-72 bg-skin-glow-a rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            class="absolute -top-8 left-36 w-60 h-60 bg-skin-glow-b rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            class="absolute -top-4 left-80 w-52 h-52 bg-skin-glow-c rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <h1 class="relative text-3xl sm:text-4xl md:text-5xl font-bold">
            <span class="bg-clip-text text-transparent bg-skin-title">角色图鉴</span>
          </h1>
          <div class="relative mt-2 text-sm md:text-lg text-fg-muted">
            <span>每一个角色，都值得被认真看见。</span>
          </div>
        </div>

        <p class="relative text-xs md:text-sm font-medium text-fg-muted flex items-center gap-1.5">
          <span class="i-carbon-grid text-xs text-fg-subtle" aria-hidden="true" />
          共收录
          <span class="font-semibold tabular-nums text-fg">{{ totalCharacters }}</span>
          位角色
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalCharacters: number;
}>();
</script>
