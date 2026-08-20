/**
 * 取消订单接口
 * POST /api/v1/orders/:id/cancel
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')

  // TODO: 取消订单
  return {
    code: 200,
    message: '订单已取消'
  }
})
