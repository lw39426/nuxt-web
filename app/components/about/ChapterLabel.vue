<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>

<template>
  <div
    class="font-['Space_Mono',monospace] text-xs tracking-[0.2em] text-purple-600 dark:text-purple-400 uppercase flex items-center gap-4"
  >
    {{ label }}
    <span class="block w-12 h-px bg-purple-600 dark:bg-purple-400" />
  </div>
</template>
