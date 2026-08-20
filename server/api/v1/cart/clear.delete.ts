/**
 * 清空购物车接口
 * DELETE /api/v1/cart/clear
 * 需要鉴权
 */
export default defineEventHandler(() => {
  // TODO: 清空购物车
  return {
    code: 200,
    message: '购物车已清空'
  }
})
