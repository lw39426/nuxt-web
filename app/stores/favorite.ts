import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FavoriteItemType } from '~/composables/api/favorite'
import { useFavoriteApi } from '~/composables/api/favorite'
import { useAuthStore } from '~/stores/auth'

/** 缓存新鲜期：期内重复进入列表/详情页不再发任何收藏查询请求 */
const STALE_MS = 5 * 60 * 1000
/** 全量拉取的 pageSize：一次请求覆盖用户全部收藏 ID */
const FULL_PAGE_SIZE = 999

/**
 * 收藏状态全局缓存（Pinia 唯一数据源）
 *
 * 解决的问题：ProductCard 每张卡片各自调 /favorite/check，一页 20 张卡片
 * 并发 20 次查询触发后端限流。
 *
 * 设计要点：
 * 1. 首次调用 ensureLoaded 仅发 1 次 GET /favorite/list，装入 Set；
 *    此后所有卡片的收藏态都是 Set.has() 的内存读取（0 请求）。
 * 2. 模块内共享 Promise 并发去重：N 个卡片同时触发也只发 1 次请求。
 * 3. 新鲜期（TTL 5 分钟）+ 置脏：跨页返回自动命中缓存，过期则静默重拉。
 * 4. 乐观更新：toggle 先改本地 Set，UI 立即反馈；成功后以后端返回回正，
 *    失败回滚并置脏。
 * 5. 未登录 / 401：按"空收藏"的合法加载态处理（同样写 loadedAt），
 *    避免未登录用户每次进页面都重复打接口。
 * 6. SSR 安全：服务端直接跳过加载（保持未收藏渲染），仅客户端缓存。
 */
export const useFavoriteStore = defineStore('favorite', () => {
  // ---------- state ----------
  const productIds = ref(new Set<number>())
  const articleIds = ref(new Set<number>())
  /** 上次成功加载时间戳，0 = 无有效缓存（失败/置脏后等待重拉） */
  const loadedAt = ref(0)
  /** 并发去重锁：进行中的全量拉取 Promise（非响应式，避免多余依赖追踪） */
  let fetchPromise: Promise<void> | null = null
  /** 登录身份快照：登录/登出/切换账号时全量作废缓存 */
  let authSnapshot: number | string | null | undefined

  const idsOf = (itemType: FavoriteItemType) => (itemType === 'product' ? productIds : articleIds)

  // ---------- getters ----------
  /** 收藏态读取：纯内存 Set 匹配，0 网络请求。列表页每张卡片都调用它 */
  const has = (itemType: FavoriteItemType, itemId: number) => idsOf(itemType).value.has(itemId)

  // ---------- actions ----------
  const isStale = () => Date.now() - loadedAt.value > STALE_MS

  function reset() {
    productIds.value = new Set()
    articleIds.value = new Set()
    loadedAt.value = 0
  }

  /**
   * 确保收藏数据已加载。所有包含收藏按钮的页面/卡片挂载时调用。
   * - 新鲜期内调用：直接返回（0 请求）
   * - 过期/置脏/首次：发 1 次全量拉取
   * - 并发调用：共享同一个 Promise，只发 1 次请求
   */
  async function ensureLoaded(force = false): Promise<void> {
    if (import.meta.server) return

    const authStore = useAuthStore()
    // 以稳定的用户身份（而非会过期的 token）作缓存归属判断
    const identity = authStore.isAuthenticated ? (authStore.user?.id ?? 'token-only') : null
    if (authSnapshot !== undefined && identity !== authSnapshot) reset()
    authSnapshot = identity

    if (!authStore.isAuthenticated) {
      // 未登录：空态也算一次"合法加载"，避免反复打接口
      reset()
      loadedAt.value = Date.now()
      return
    }
    if (!force && loadedAt.value !== 0 && !isStale()) return
    if (fetchPromise) return fetchPromise

    fetchPromise = useFavoriteApi()
      .list({ pageSize: FULL_PAGE_SIZE }, { suppressErrorToast: true })
      .then((data) => {
        const products = new Set<number>()
        const articles = new Set<number>()
        for (const fav of data?.favorites || []) {
          ;(fav.item_type === 'product' ? products : articles).add(fav.item_id)
        }
        productIds.value = products
        articleIds.value = articles
        loadedAt.value = Date.now()
      })
      .catch((e: { code?: number; message?: string }) => {
        if (e?.code === 401) {
          // 静默刷新也失败（登录已失效）：按未登录空态处理，不反复重试
          reset()
          loadedAt.value = Date.now()
        }
        // 其他失败：loadedAt 保持 0，下次进入页面自动重试（不阻塞商品渲染）
        throw e
      })
      .finally(() => {
        fetchPromise = null
      })

    return fetchPromise
  }

  /**
   * 收藏 / 取消收藏（乐观更新）：
   * 1. 先改本地 Set —— 心形立即反馈，无需等待网络
   * 2. 请求成功后以后端返回回正（防止并发/幂等错位）
   * 3. 失败回滚 + 置脏，下次进入页面强制重拉，本地状态不会长期漂移
   */
  async function toggle(itemType: FavoriteItemType, itemId: number): Promise<boolean> {
    const target = idsOf(itemType)
    const next = !target.value.has(itemId)
    if (next) target.value.add(itemId)
    else target.value.delete(itemId)

    try {
      const res = await useFavoriteApi().toggle({ item_type: itemType, item_id: itemId })
      const serverNext = !!res?.is_favorited
      if (serverNext) target.value.add(itemId)
      else target.value.delete(itemId)
      return serverNext
    } catch (e) {
      // 回滚乐观状态
      if (next) target.value.delete(itemId)
      else target.value.add(itemId)
      // 失败后本地缓存已不可信，下次 ensureLoaded 强制重拉
      loadedAt.value = 0
      throw e
    }
  }

  /** 其他页面直接调 remove 接口取消收藏时，同步本地缓存 */
  function markRemoved(itemType: FavoriteItemType, itemId: number) {
    idsOf(itemType).value.delete(itemId)
  }

  /** 置脏：标记缓存过期，下次 ensureLoaded 强制重拉（跨端同步等场景） */
  function invalidate() {
    loadedAt.value = 0
  }

  return {
    // state
    productIds,
    articleIds,
    loadedAt,
    // getters
    has,
    // actions
    ensureLoaded,
    toggle,
    markRemoved,
    invalidate
  }
})
