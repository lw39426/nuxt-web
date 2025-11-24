export interface CartItem {
  id: number
  productId: number
  title: string
  price: number
  quantity: number
}

/**
 * 购物车模块 API 封装
 */
export function useCartApi() {
  const { get, post, put, del } = useApi()

  /**
   * 获取购物车（GET /miniapp/api/cart）
   */
  async function list() {
    return await get<CartItem[]>('/miniapp/api/cart')
  }

  /**
   * 添加商品到购物车（POST /miniapp/api/cart）
   */
  async function add(payload: { productId: number; quantity: number }) {
    return await post<CartItem>('/miniapp/api/cart', payload)
  }

  /**
   * 更新购物车商品数量（PUT /miniapp/api/cart/<id>）
   */
  async function update(cartItemId: number, quantity: number) {
    return await put<CartItem>(`/miniapp/api/cart/${cartItemId}`, { quantity })
  }

  /**
   * 删除购物车商品（DELETE /miniapp/api/cart/<id>）
   */
  async function remove(cartItemId: number) {
    return await del<null>(`/miniapp/api/cart/${cartItemId}`)
  }

  /**
   * 清空购物车（DELETE /miniapp/api/cart/clear）
   */
  async function clear() {
    return await del<null>('/miniapp/api/cart/clear')
  }

  return { list, add, update, remove, clear }
}
