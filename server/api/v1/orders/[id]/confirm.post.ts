/**
 * 确认收货接口
 * POST /api/v1/orders/:id/confirm
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')

  // TODO: 确认收货
  return {
    code: 200,
    message: '已确认收货'
  }
})
