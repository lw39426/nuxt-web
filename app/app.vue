<template>
  <UApp>
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <AppGlobalLoader />
      <AuthModal />
    </ClientOnly>
  </UApp>
</template>

<script setup lang="ts">
import { nextTick, watch } from 'vue';
import { useRoute, useRouter } from '#imports';
import { useUiStore } from '~/stores/ui';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const router = useRouter();
const uiStore = useUiStore();
const authStore = useAuthStore();
const { openAuthModal } = uiStore;
const { public: runtimePublic } = useRuntimeConfig();
console.log('NUXT_PUBLIC_API_BASE:', runtimePublic.apiBase);

// 初始化认证状态（从 Cookie 读取，确保刷新后登录状态不丢失，SSR 与客户端均执行）
authStore.initAuthFromCookie();

if (import.meta.client) {
  watch(
    () => route.query.authModal,
    async (authModal) => {
      if (authModal !== 'login') return;
      if (authStore.isAuthenticated) return;

      openAuthModal('login');

      const { authModal: _ignored, ...restQuery } = route.query;
      await nextTick();
      router.replace({ query: restQuery });
    },
    { immediate: true }
  );
}
</script>
