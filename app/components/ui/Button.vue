<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'brand' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false
});
</script>

<template>
  <button
    class="inline-flex items-center justify-center font-medium rounded-full transition-all duration-200"
    :class="[
      {
        'px-4 py-1.5 text-xs': size === 'sm',
        'px-6 py-2.5 text-sm': size === 'md',
        'px-8 py-3 text-base': size === 'lg'
      },
      {
        'bg-fg text-canvas hover:bg-fg/90 active:scale-[0.98]': variant === 'primary',
        'bg-brand text-on-brand hover:bg-brand-hover active:scale-[0.98]': variant === 'brand',
        'bg-transparent text-fg-muted hover:bg-surface-muted': variant === 'ghost',
        'bg-transparent border border-line text-fg hover:border-lineStrong': variant === 'outline'
      },
      { 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="i-carbon-circle-dash w-4 h-4 animate-spin mr-2" />
    <slot />
  </button>
</template>
