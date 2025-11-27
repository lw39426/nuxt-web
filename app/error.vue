<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-4">
    <!-- Logo -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-xl font-bold font-display text-gray-900">
        <div class="logo">
          <!-- prettier-ignore -->
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>Mintlify</span>
      </div>
    </div>

    <!-- Error Content -->
    <div class="text-center max-w-md w-full">
      <!-- Error Code -->
      <div class="text-8xl font-bold text-gray-900 mb-4">
        {{ error.statusCode }}
      </div>

      <!-- Error Title -->
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        {{ error.statusCode === 404 ? '页面未找到' : '出错了' }}
      </h1>

      <!-- Error Message -->
      <p class="text-gray-600 mb-8 text-lg leading-relaxed">
        {{ error.statusMessage || getErrorMessage(error.statusCode) }}
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          class="px-6 py-3 bg-mint-500 text-white rounded-lg font-semibold hover:bg-mint-600 transition-colors"
          @click="handleError"
        >
          返回首页
        </button>
        <button
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          @click="clearError"
        >
          重试
        </button>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-500 mb-4">如果问题持续存在，请联系我们</p>
        <div class="flex justify-center gap-4">
          <a href="mailto:support@mintlify.com" class="text-mint-500 hover:text-mint-600 font-medium"> 技术支持 </a>
          <span class="text-gray-300">|</span>
          <a href="/" class="text-mint-500 hover:text-mint-600 font-medium"> 帮助中心 </a>
        </div>
      </div>
    </div>

    <!-- Background Pattern -->
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div
        class="absolute left-[50%] top-0 h-[50vh] w-full -translate-x-1/2 bg-gradient-to-b from-mint-50 to-transparent"
      />
      <svg
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
        width="800"
        height="800"
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="400" cy="400" r="300" stroke="currentColor" stroke-width="2" />
        <circle cx="400" cy="400" r="200" stroke="currentColor" stroke-width="2" />
        <circle cx="400" cy="400" r="100" stroke="currentColor" stroke-width="2" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NuxtError {
  statusCode: number
  statusMessage?: string
  message?: string
}

const props = defineProps<{
  error: NuxtError
}>()
const route = useRoute()

/**
 * 根据错误码获取友好的错误消息
 */
const getErrorMessage = (statusCode: number): string => {
  const messages: Record<number, string> = {
    404: '抱歉，您访问的页面不存在或已被移除',
    403: '抱歉，您没有权限访问此页面',
    500: '服务器内部错误，请稍后再试',
    503: '服务暂时不可用，请稍后再试'
  }
  return messages[statusCode] || '发生未知错误，请稍后再试'
}

/**
 * 处理错误 - 返回首页
 */
const handleError = () => {
  navigateTo('/')
}

/**
 * 清除错误并重试当前页面
 */
const clearError = () => {
  navigateTo(route.fullPath)
}

// 设置页面标题
useHead({
  title: `${props.error.statusCode} - ${props.error.statusCode === 404 ? '页面未找到' : '出错了'}`,
  meta: [{ name: 'description', content: getErrorMessage(props.error.statusCode) }]
})
</script>

<style scoped>
.logo svg {
  color: #10b981;
}
</style>
