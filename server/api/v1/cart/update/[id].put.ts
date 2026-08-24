/**
 * 更新购物车项数量接口
 * PUT /api/v1/cart/update/:id
 * 请求体: { quantity: number }
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!body?.quantity || Number(body.quantity) < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: '数量必须大于0'
    })
  }

  return proxyOnly<Record<string, any>>(event, `/cart/update/${id}`, {
    method: 'PUT',
    body
  })
})
