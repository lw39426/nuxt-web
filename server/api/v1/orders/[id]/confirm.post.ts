/**
 * 确认收货接口
 * POST /api/v1/orders/:id/confirm
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event).catch(() => ({}))

  return proxyOnly<null>(event, `/orders/${id}/confirm`, { body: body ?? {} })
})
