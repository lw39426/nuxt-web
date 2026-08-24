/**
 * 支付订单接口
 * POST /api/v1/orders/:id/pay
 * 请求体: { payment_method: string, amount: number }
 * 需要鉴权；支付类操作仅代理 Flask，严禁 Mock 降级（避免伪造支付成功）
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!body?.payment_method || !body?.amount) {
    throw createError({
      statusCode: 400,
      statusMessage: '支付方式和金额不能为空'
    })
  }

  return proxyOnly<Record<string, any>>(event, `/orders/${id}/pay`, { body })
})
