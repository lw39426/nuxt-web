<script setup lang="ts">
interface Props {
  hoverable?: boolean;
}

withDefaults(defineProps<Props>(), {
  hoverable: false
});
</script>

<template>
  <div
    class="bg-surface rounded-2xl shadow-sm transition-shadow duration-300"
    :class="{ 'hover:shadow-md': hoverable }"
  >
    <slot />
  </div>
</template>
