<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  hideFooter: true,
  hideFloatingMenu: false,
  hideAiEntry: true,
  hideCompareBar: true,
  fullViewport: true,
  navbarScrollBehavior: 'static'
});
useSeoMeta({ title: '消息', robots: 'noindex, nofollow' });
</script>

<template>
  <ClientOnly>
    <ChatWorkspace />
    <template #fallback>
      <div
        class="flex min-h-0 flex-1 items-center justify-center text-sm text-gray-500"
        role="status"
      >
        正在准备聊天界面…
      </div>
    </template>
  </ClientOnly>
</template>
