import { onBeforeUnmount, readonly, shallowReadonly, shallowRef, useTemplateRef } from 'vue'
import { useToast } from '#imports'
import { useUserApi } from '~/composables/api/user'
import { useAuthStore } from '~/stores/auth'

/** 管理个人封面的选图、预览、上传及侧栏状态同步。 */
export function useProfileCover() {
  const auth = useAuthStore()
  const toast = useToast()
  const { uploadImage } = useUserApi()
  const coverInput = useTemplateRef<HTMLInputElement>('coverInput')
  const pendingCover = shallowRef<{ file: File; previewUrl: string }>()
  const coverUploading = shallowRef(false)
  const coverError = shallowRef('')

  /** 打开封面文件选择器，上传期间禁止重复选择。 */
  function chooseCover() {
    if (coverUploading.value) return
    coverInput.value?.click()
  }

  /** 清理待上传封面，并释放本地预览 URL。 */
  function discardPendingCover() {
    if (pendingCover.value) URL.revokeObjectURL(pendingCover.value.previewUrl)
    pendingCover.value = undefined
    coverError.value = ''
  }

  /** 接收选图结果，重置文件输入以允许再次选择同一张图片。 */
  function onCoverChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file || coverUploading.value) return
    discardPendingCover()
    pendingCover.value = { file, previewUrl: URL.createObjectURL(file) }
  }

  /** 关闭预览时清理选图，上传期间保留正在使用的文件。 */
  function onCoverModalChange(open: boolean) {
    if (!open && !coverUploading.value) discardPendingCover()
  }

  /** 通过真实封面接口保存图片，仅同步发起上传的当前账号。 */
  async function confirmCoverUpload() {
    const file = pendingCover.value?.file
    const userId = auth.user?.id
    if (!file || coverUploading.value || userId === undefined) return
    coverUploading.value = true
    coverError.value = ''
    try {
      const result = await uploadImage(file, 'bgCover')
      const url = result.bg_cover?.trim()
      if (!url) throw new Error('上传响应未返回封面地址，请刷新资料确认')
      if (!auth.user || auth.user.id !== userId) return
      auth.setAuth({ user: { ...auth.user, bg_cover: url } })
      toast.add({ title: '个人封面已更新', color: 'success' })
      discardPendingCover()
    } catch (error) {
      if (auth.user?.id !== userId) return
      coverError.value =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : '封面上传失败，请重试'
    } finally {
      coverUploading.value = false
    }
  }

  onBeforeUnmount(discardPendingCover)

  return {
    pendingCover: shallowReadonly(pendingCover),
    coverUploading: readonly(coverUploading),
    coverError: readonly(coverError),
    chooseCover,
    onCoverChange,
    onCoverModalChange,
    confirmCoverUpload
  }
}
