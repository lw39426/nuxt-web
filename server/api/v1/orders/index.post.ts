import { createError } from 'h3'

/**
 * 创建订单接口
 * POST /api/v1/orders
 * 请求体: { address_id: number, items: [{product_id, quantity}], remark?: string }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { address_id, items, _remark } = body

  if (!address_id || !items || items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '收货地址和商品不能为空'
    })
  }

  // TODO: 创建订单逻辑
  const orderNo = 'ORDER' + Date.now()
  return {
    code: 200,
    message: '订单创建成功',
    data: {
      order_id: Date.now(),
      order_no: orderNo,
      total_amount: 0
    }
  }
})
