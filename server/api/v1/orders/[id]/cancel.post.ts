/**
 * 取消订单接口
 * POST /api/v1/orders/:id/cancel
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event).catch(() => ({}))

  return proxyOnly<null>(event, `/orders/${id}/cancel`, { body: body ?? {} })
})
