<template>
  <div class="bg-canvas-elevated pt-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 md:mb-16"
      >
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

          <h1 class="relative text-5xl font-bold mb-2">
            <span class="bg-clip-text text-transparent bg-skin-title">角色图鉴</span>
          </h1>
          <div class="relative mt-4 text-xl font-medium text-fg-muted">
            <span class="text-fg font-bold">每一个角色，都值得被认真看见。</span>
          </div>
        </div>

        <p class="text-sm font-medium text-fg-muted flex items-center gap-1.5 md:justify-end">
          <span class="i-carbon-grid text-xs text-fg-subtle" aria-hidden="true" />
          共收录
          <span class="text-base font-bold text-fg">{{ totalCharacters }}</span>
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
