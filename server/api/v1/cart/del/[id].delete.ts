/**
 * 删除购物车项接口
 * DELETE /api/v1/cart/del/:id
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  return proxyOnly<null>(event, `/cart/del/${id}`, { method: 'DELETE' })
})
