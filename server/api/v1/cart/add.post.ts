/**
 * 加入购物车接口
 * POST /api/v1/cart/add
 * 请求体: { product_id: number, quantity: number }
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.product_id || !body?.quantity) {
    throw createError({
      statusCode: 400,
      statusMessage: '商品ID和数量不能为空'
    })
  }

  return proxyOnly<Record<string, any>>(event, '/cart/add', { body })
})
