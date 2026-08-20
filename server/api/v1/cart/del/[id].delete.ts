/**
 * 删除购物车项接口
 * DELETE /api/v1/cart/del/:id
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')

  // TODO: 删除购物车项
  return {
    code: 200,
    message: '删除成功'
  }
})
