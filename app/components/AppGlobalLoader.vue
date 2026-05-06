<template>
  <Transition name="global-loader-fade">
    <div
      v-if="globalPageLoading"
      id="__app-loading__"
      class="loading"
      role="status"
      aria-live="polite"
      aria-label="页面加载中"
    >
      <div class="loader"></div>
      <div
        class="mt-[28px] text-[#000000cf] dark:text-[#d1d5db] text-[22px] font-600 letter-spacing-[0.02em]"
      >
        页面加载中...
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const globalPageLoading = useState<boolean>('globalPageLoading', () => true);
</script>
