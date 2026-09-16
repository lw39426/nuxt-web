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
  <!-- 暗黑下页面底用 canvas（更深），与卡片 surface 拉开层次，避免整片糊在一起 -->
  <!-- profile-skin-scope：把 Nuxt UI primary 色映射到当前皮肤主色（仅个人中心生效） -->
  <div class="profile-skin-scope bg-surfaceMuted dark:bg-canvas min-h-screen">
    <div class="section-container py-6 sm:py-8">
      <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
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
