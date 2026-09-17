import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** 对比栏最多同时容纳的角色数 */
export const MAX_COMPARE = 4

/** 对比栏条目：仅存展示所需的最小字段（详情由 /compare 页按 id 拉取） */
export interface CompareItem {
  id: number
  name: string
}

/**
 * 角色对比栏全局状态（Pinia）
 *
 * 设计要点：
 * 1. 只存 id + name 的轻量对象：列表页 / 详情页「加入对比」时写入；
 *    /compare 页按 id 拉取完整详情，避免大对象序列化与 SSR 水合负担。
 * 2. 持久化到 localStorage：跨页面 / 刷新后对比栏不丢。
 * 3. SSR 安全：服务端跳过 localStorage 读写，保持空数组渲染；
 *    消费方（CompareBar / compare 页）在 onMounted 中调用 restore()，
 *    确保状态恢复发生在水合之后。
 */
export const useCompareStore = defineStore('compare', () => {
  // ---------- state ----------
  /** 已加入对比的角色列表（按加入顺序） */
  const items = ref<CompareItem[]>([])
  /** localStorage 持久化 key */
  const STORAGE_KEY = 'youmi-compare-items'
  /** 是否已执行过恢复（幂等标记，防止重复读取覆盖内存态） */
  const restored = ref(false)

  // ---------- init ----------
  /** 客户端挂载时从 localStorage 恢复（幂等） */
  function restore() {
    if (!import.meta.client || restored.value) return
    restored.value = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) {
        items.value = parsed
          .filter((v) => v && Number.isFinite(v.id) && typeof v.name === 'string')
          .slice(0, MAX_COMPARE)
      }
    } catch {
      // 解析失败按空处理，不阻塞渲染
    }
  }

  /** 同步到 localStorage；写入失败静默忽略（隐私模式等场景） */
  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // 忽略
    }
  }

  // ---------- getters ----------
  /** 当前对比数量 */
  const count = computed(() => items.value.length)
  /** 是否已满（满 4 个后加入按钮转为提示） */
  const isFull = computed(() => items.value.length >= MAX_COMPARE)
  /** 全部角色 id（供 /compare 页拉详情） */
  const ids = computed(() => items.value.map((i) => i.id))
  /** 判断某角色是否已在对比栏 */
  const has = (id: number) => items.value.some((i) => i.id === id)

  // ---------- actions ----------
  /** 加入对比：已存在或已满时返回 false（调用方可据此提示） */
  function add(item: CompareItem) {
    if (has(item.id) || items.value.length >= MAX_COMPARE) return false
    items.value.push(item)
    persist()
    return true
  }

  /** 从对比栏移除 */
  function remove(id: number) {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx >= 0) {
      items.value.splice(idx, 1)
      persist()
    }
  }

  /** 已存在则移除并返回 'removed'，否则尝试加入并返回 'added' / 'rejected' */
  function toggle(item: CompareItem): 'added' | 'removed' | 'rejected' {
    if (has(item.id)) {
      remove(item.id)
      return 'removed'
    }
    return add(item) ? 'added' : 'rejected'
  }

  /** 清空对比栏 */
  function clear() {
    items.value = []
    persist()
  }

  return { items, ids, count, isFull, restore, has, add, remove, toggle, clear }
})
