<template>
  <!-- 仅在客户端渲染加载界面，避免 SSR/水合不匹配 -->
  <ClientOnly>
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
    <!-- SSR 占位：保持布局稳定，水合后立即被替换 -->
    <template #fallback>
      <div id="__app-loading__" class="loading hidden" aria-hidden="true"></div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const globalPageLoading = useState<boolean>('globalPageLoading', () => false);
</script>
