<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-fg">{{ title }}</h1>
    <p v-if="subtitle" class="text-sm text-fg-subtle mt-1">{{ subtitle }}</p>
  </div>
</template>
