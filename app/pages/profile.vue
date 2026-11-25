<script setup lang="ts">
import { useProfileSkin } from '~/composables/useProfileSkin';
import { useProfileCover } from '~/composables/useProfileCover';

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

const {
  pendingCover,
  coverUploading,
  coverError,
  chooseCover,
  onCoverChange,
  onCoverModalChange,
  confirmCoverUpload
} = useProfileCover();
</script>

<template>
  <div class="profile-skin-scope bg-surfaceMuted dark:bg-canvas min-h-screen">
    <input
      ref="coverInput"
      type="file"
      class="hidden"
      accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
      aria-label="选择个人封面图片"
      @change="onCoverChange"
    />
    <!-- 暗黑下页面底用 canvas（更深），与卡片 surface 拉开层次，避免整片糊在一起 -->
    <!-- profile-skin-scope：把 Nuxt UI primary 色映射到当前皮肤主色（仅个人中心生效） -->
    <div class="section-container profile-container py-4 sm:py-6 lg:py-8">
      <div class="flex flex-col lg:flex-row gap-5 lg:gap-8">
        <!-- 侧边栏 -->
        <aside class="w-full lg:w-60 shrink-0">
          <div class="lg:sticky lg:top-[106px]">
            <div class="bg-surface rounded-2xl shadow-sm overflow-hidden">
              <ProfileSidebar :cover-uploading="coverUploading" @change-cover="chooseCover" />
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

    <UModal
      :open="!!pendingCover"
      title="更换个人封面"
      description="确认后会立即保存个人封面，不影响头像和其他资料。"
      :dismissible="!coverUploading"
      :close="!coverUploading"
      :ui="{ content: 'fixed left-1/2 top-1/2' }"
      @update:open="onCoverModalChange"
    >
      <template #body>
        <img
          v-if="pendingCover"
          :src="pendingCover.previewUrl"
          alt="待上传的个人封面预览"
          class="max-h-72 w-full rounded-xl object-contain"
        />
        <p class="mt-3 break-all text-sm text-fg-muted">{{ pendingCover?.file.name }}</p>
        <p class="mt-1 text-xs text-fg-subtle">支持 JPG、PNG、GIF、BMP、WebP，大小不超过 10MB。</p>
        <p v-if="coverError" role="alert" class="mt-3 text-sm text-red-500">
          {{ coverError }}
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="soft"
            :disabled="coverUploading"
            @click="onCoverModalChange(false)"
          >
            取消
          </UButton>
          <UButton color="primary" :loading="coverUploading" @click="confirmCoverUpload">
            {{ coverError ? '重新上传' : '确认并上传' }}
          </UButton>
        </div>
      </template>
    </UModal>
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
