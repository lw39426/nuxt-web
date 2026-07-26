import type { Product } from '~/types/product'

/** 购物车项 */
export interface CartItem {
  id: number
  product_id: number
  quantity: number
  product?: Product
}

/** 购物车列表响应 */
export interface CartListResult {
  items: CartItem[]
  total_price: number
}

/**
 * 购物车模块 API 封装
 * 前缀: /cart
 * 需要鉴权 — 所有接口
 */
export function useCartApi() {
  const { get, post, put, del } = useApi()

  /**
   * 获取购物车列表
   * GET /cart/list
   */
  async function list() {
    return await get<CartListResult>('/cart/list')
  }

  /**
   * 加入购物车
   * POST /cart/add
   */
  async function add(payload: { product_id: number; quantity: number }) {
    return await post<CartItem>('/cart/add', payload)
  }

  /**
   * 更新购物车项数量
   * PUT /cart/update/<cart_item_id>
   */
  async function update(cartItemId: number, quantity: number) {
    return await put<CartItem>(`/cart/update/${cartItemId}`, { quantity })
  }

  /**
   * 删除购物车项
   * DELETE /cart/del/<cart_item_id>
   */
  async function remove(cartItemId: number) {
    return await del<null>(`/cart/del/${cartItemId}`)
  }

  /**
   * 清空购物车
   * DELETE /cart/clear
   */
  async function clear() {
    return await del<null>('/cart/clear')
  }

  return { list, add, update, remove, clear }
}
