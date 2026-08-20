/**
 * 获取相关推荐商品接口
 * GET /api/v1/product/:code/related
 */
export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  const query = getQuery(event)
  const _limit = Number(query.limit) || 8

  // TODO: 查询相关商品
  return {
    code: 200,
    message: 'success',
    data: {
      product_id: 1,
      product_code: code,
      category_id: 1,
      related: [],
      total: 0
    }
  }
})
