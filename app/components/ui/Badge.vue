<script setup lang="ts">
interface Props {
  variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'sm'
});
</script>

<template>
  <span
    class="inline-flex items-center font-medium rounded-lg"
    :class="[
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      {
        'bg-brand-soft text-brand': variant === 'brand',
        'bg-surface-muted text-fg-muted': variant === 'neutral',
        'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400':
          variant === 'success',
        'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400':
          variant === 'warning',
        'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400': variant === 'error'
      }
    ]"
  >
    <slot />
  </span>
</template>
