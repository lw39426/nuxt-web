<template>
  <AiCompanion />
</template>

<script setup lang="ts">
definePageMeta({
  hideNavbar: true,
  hideFooter: true
})
// 该页面仅作为一个壳，具体的聊天逻辑都封装在 AiCompanion.client.vue 中
// Nuxt 遇到 .client.vue 后缀的组件时，会自动跳过它的服务端渲染 (SSR)
// 从而彻底避免 @ai-sdk/vue 在 Node.js 环境下运行报错的问题。
</script>
