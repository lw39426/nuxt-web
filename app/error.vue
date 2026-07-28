<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps({
  error: {
    type: Object as () => NuxtError,
    default: () => ({ statusCode: 500, message: 'An error occurred' })
  }
});

const handleError = () => clearError({ redirect: '/' });
const goBack = () => useRouter().back();

const errorInfo = computed(() => {
  const code = props.error?.statusCode || 500;
  switch (code) {
    case 404:
      return {
        title: '页面未找到',
        message: '抱歉，您访问的页面不存在或已被移除。',
        icon: 'i-carbon-location-heart-filled'
      };
    case 403:
      return {
        title: '访问受限',
        message: '您没有权限访问此页面。请确认账号权限或联系管理员。',
        icon: 'i-carbon-security'
      };
    case 500:
    case 502:
    case 503:
    case 504:
    case 505:
      return {
        title: '服务器异常',
        message: '服务器暂时不可用，我们正在紧急修复中。请稍后再试。',
        icon: 'i-carbon-data-error'
      };
    default:
      return {
        title: '发生错误',
        message: props.error?.message || '发生未知错误，请稍后再试。',
        icon: 'i-carbon-warning-alt'
      };
  }
});

useHead({
  title: `${props.error?.statusCode} - ${errorInfo.value.title}`
});
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gray-100 dark:bg-white/5 blur-3xl"
      />
      <div
        class="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-gray-50 dark:bg-white/5 blur-3xl"
      />
    </div>

    <div class="relative z-10 text-center max-w-lg mx-auto">
      <!-- Icon/Status -->
      <div class="mb-8 relative inline-block">
        <div class="text-9xl font-bold text-gray-50 dark:text-gray-900 select-none">
          {{ error?.statusCode }}
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div :class="errorInfo.icon" class="text-6xl text-black dark:text-white" />
        </div>
      </div>

      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {{ errorInfo.title }}
      </h1>

      <p class="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
        {{ errorInfo.message }}
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          class="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          @click="handleError"
        >
          <div class="i-carbon-home" />
          返回首页
        </button>
        <button
          class="px-8 py-3 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          @click="goBack"
        >
          <div class="i-carbon-arrow-left" />
          返回上页
        </button>
      </div>
    </div>

    <!-- Footer info -->
    <div class="absolute bottom-8 text-sm text-gray-400 dark:text-gray-600 font-mono">
      错误代码: {{ error?.statusCode }}
    </div>
  </div>
</template>
