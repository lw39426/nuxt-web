import { createError } from 'h3'

/**
 * 加入购物车接口
 * POST /api/v1/cart/add
 * 请求体: { product_id: number, quantity: number }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { product_id, quantity } = body

  if (!product_id || !quantity) {
    throw createError({
      statusCode: 400,
      statusMessage: '商品ID和数量不能为空'
    })
  }

  // TODO: 添加到购物车
  return {
    code: 200,
    message: '添加成功',
    data: {
      id: Date.now(),
      product_id,
      quantity
    }
  }
})
