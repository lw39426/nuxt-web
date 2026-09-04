/**
 * 加入购物车接口
 * POST /api/v1/cart/add
 * 请求体: { product_code: string, quantity: number }
 * 后端实际以 product_code 定位商品（与接口文档的 product_id 描述不一致，以实测为准）
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.product_code || !body?.quantity) {
    throw createError({
      statusCode: 400,
      statusMessage: '商品编码和数量不能为空'
    })
  }

  return proxyOnly<Record<string, any>>(event, '/cart/add', { body })
})
