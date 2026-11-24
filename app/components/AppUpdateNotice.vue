<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { useNuxtApp } from '#imports';

const updateAvailable = ref(false);
const removeHook = useNuxtApp().hook('app:manifest:update', () => {
  updateAvailable.value = true;
});
onUnmounted(removeHook);

function refresh() {
  window.location.reload();
}
</script>

<template>
  <aside v-if="updateAvailable" role="status" aria-live="polite" class="update-notice">
    <div>
      <strong>新版本已发布</strong>
      <p>请保存当前内容，再刷新更新。</p>
    </div>
    <UButton size="sm" @click="refresh">刷新更新</UButton>
  </aside>
</template>

<style scoped>
.update-notice {
  position: fixed;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: calc(100vw - 32px);
  padding: 16px;
  border: 1px solid var(--ui-border);
  border-radius: 12px;
  background: var(--ui-bg);
  color: var(--ui-text);
  box-shadow: 0 4px 24px rgb(0 0 0 / 12%);
}

.update-notice p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ui-text-muted);
}
</style>
