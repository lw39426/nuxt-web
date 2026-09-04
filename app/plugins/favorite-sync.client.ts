/**
 * 收藏缓存跨端同步（仅客户端）
 *
 * 用户可能在 App 端修改收藏，Web 端无法收到推送。这里监听标签页回到前台，
 * 将收藏缓存置脏并静默重拉（复用 ensureLoaded 的并发去重），保证
 * 列表/详情展示的收藏态与用户最新数据一致。
 */
export default defineNuxtPlugin(() => {
  const favoriteStore = useFavoriteStore()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      favoriteStore.invalidate()
      favoriteStore.ensureLoaded().catch(() => {
        // 后台静默同步失败不提示（已 suppressErrorToast），下次回到前台再试
      })
    }
  })
})
