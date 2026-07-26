import type { Pagination } from '~/types/api'

/** 收藏类型 */
export type FavoriteItemType = 'product' | 'article'

/** 收藏操作请求体 */
export interface FavoritePayload {
  item_type: FavoriteItemType
  item_id: number
}

/** 收藏列表项 */
export interface FavoriteItem {
  id: number
  item_type: FavoriteItemType
  item_id: number
  item_title: string
  item_image: string
  item_description: string
  created_at: string
}

/** 收藏列表查询参数 */
export interface FavoriteListParams {
  page?: number
  pageSize?: number
  item_type?: FavoriteItemType
}

/**
 * 收藏模块 API 封装
 * 前缀: /favorite
 * 需要鉴权
 */
export function useFavoriteApi() {
  const { get, post } = useApi()

  /**
   * 收藏 / 取消收藏（切换）
   * POST /favorite/toggle
   */
  async function toggle(payload: FavoritePayload) {
    return await post<{ is_favorited: boolean }>('/favorite/toggle', payload)
  }

  /**
   * 检查是否已收藏
   * POST /favorite/check
   */
  async function check(payload: FavoritePayload) {
    return await post<{ is_favorited: boolean }>('/favorite/check', payload)
  }

  /**
   * 获取收藏列表
   * GET /favorite/list
   */
  async function list(params?: FavoriteListParams) {
    return await get<{ favorites: FavoriteItem[]; pagination: Pagination }>(
      '/favorite/list',
      params
    )
  }

  /**
   * 获取收藏数量
   * GET /favorite/count
   */
  async function count(itemType?: FavoriteItemType) {
    return await get<{ count: number }>(
      '/favorite/count',
      itemType ? { item_type: itemType } : undefined
    )
  }

  /**
   * 移除收藏
   * POST /favorite/remove
   */
  async function remove(payload: FavoritePayload) {
    return await post<null>('/favorite/remove', payload)
  }

  /**
   * 清空收藏
   * POST /favorite/clear
   */
  async function clear(itemType?: FavoriteItemType) {
    return await post<null>('/favorite/clear', itemType ? { item_type: itemType } : undefined)
  }

  return { toggle, check, list, count, remove, clear }
}
