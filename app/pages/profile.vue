<script setup lang="ts">
import { useProfileSkin } from '~/composables/useProfileSkin';

definePageMeta({
  middleware: 'auth',
  hideFooter: true
});

/**
 * 个人中心布局（皮肤系统入口）
 * - 进入时从 localStorage 恢复皮肤并写入 <html data-profile-skin>，
 *   onMounted 触发保证发生在水合之后（SSR 安全，无属性不匹配）
 */
const { restore: restoreSkin } = useProfileSkin();
onMounted(restoreSkin);
</script>

<template>
  <div class="profile-skin-scope bg-surfaceMuted dark:bg-canvas min-h-screen">
    <!-- 暗黑下页面底用 canvas（更深），与卡片 surface 拉开层次，避免整片糊在一起 -->
    <!-- profile-skin-scope：把 Nuxt UI primary 色映射到当前皮肤主色（仅个人中心生效） -->
    <div class="section-container profile-container py-4 sm:py-6 lg:py-8">
      <div class="flex flex-col lg:flex-row gap-5 lg:gap-8">
        <!-- 侧边栏 -->
        <aside class="w-full lg:w-60 shrink-0">
          <div class="lg:sticky lg:top-24">
            <div class="bg-surface rounded-2xl shadow-sm overflow-hidden">
              <ProfileSidebar />
            </div>
          </div>
        </aside>

        <!-- 右侧内容区 -->
        <main class="flex-1 min-w-0">
          <NuxtPage v-slot="{ Component }">
            <Transition name="fade-slide" mode="out-in">
              <KeepAlive>
                <component :is="Component" />
              </KeepAlive>
            </Transition>
          </NuxtPage>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 639px) {
  .profile-container {
    padding-inline: 1rem;
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
  }
  main :deep(h1) {
    font-size: 1.25rem;
  }
  main :deep(.mb-8:has(> h1)) {
    margin-bottom: 1rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: none !important;
  }
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
