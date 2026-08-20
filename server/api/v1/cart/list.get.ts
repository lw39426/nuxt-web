/**
 * 获取购物车列表接口
 * GET /api/v1/cart/list
 * 需要鉴权
 */
export default defineEventHandler(() => {
  // TODO: 根据用户ID查询购物车
  return {
    code: 200,
    message: 'success',
    data: {
      items: [],
      total_price: 0
    }
  }
})
