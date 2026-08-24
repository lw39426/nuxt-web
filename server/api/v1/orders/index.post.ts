/**
 * 创建订单接口
 * POST /api/v1/orders
 * 请求体: { address_id: number, items: [{product_id, quantity}], remark?: string }
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级（避免伪造下单成功）
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.address_id || !Array.isArray(body?.items) || body.items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '收货地址和商品不能为空'
    })
  }

  return proxyOnly<Record<string, any>>(event, '/orders', { body })
})
