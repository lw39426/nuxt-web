<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

onMounted(() => {
  navigateTo('/profile/account', { replace: true });
});
</script>

<template>
  <div class="flex items-center justify-center py-20">
    <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-fg-subtle" />
  </div>
</template>
