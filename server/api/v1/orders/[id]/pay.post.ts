import { createError } from 'h3'

/**
 * 支付订单接口
 * POST /api/v1/orders/:id/pay
 * 请求体: { payment_method: string, amount: number }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { payment_method, amount } = body

  if (!payment_method || !amount) {
    throw createError({
      statusCode: 400,
      statusMessage: '支付方式和金额不能为空'
    })
  }

  // TODO: 处理支付逻辑
  return {
    code: 200,
    message: '支付成功'
  }
})
