import { createError } from 'h3'

/**
 * 更新购物车项数量接口
 * PUT /api/v1/cart/update/:id
 * 请求体: { quantity: number }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { quantity } = body

  if (!quantity || quantity < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: '数量必须大于0'
    })
  }

  // TODO: 更新购物车项
  return {
    code: 200,
    message: '更新成功',
    data: {
      id: Number(id),
      quantity
    }
  }
})
