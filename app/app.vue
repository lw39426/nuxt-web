<template>
  <UApp>
    <AppGlobalLoader />
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
    <AuthModal />
  </UApp>
</template>

<script setup lang="ts">
import { nextTick, watch } from 'vue';
import { useRoute, useRouter } from '#imports';
import { useUiStore } from '~/stores/ui';

const route = useRoute();
const router = useRouter();
const uiStore = useUiStore();
const { openAuthModal } = uiStore;

if (import.meta.client) {
  watch(
    () => route.query.authModal,
    async (authModal) => {
      if (authModal !== 'login') return;

      openAuthModal('login');

      const { authModal: _ignored, ...restQuery } = route.query;
      await nextTick();
      router.replace({ query: restQuery });
    },
    { immediate: true }
  );
}
</script>
