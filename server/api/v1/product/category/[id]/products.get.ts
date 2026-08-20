/**
 * 获取分类下的商品接口
 * GET /api/v1/product/category/:id/products
 * 查询参数: page, pageSize, sort_by, sort_order
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')
  const query = getQuery(event)
  const { page = 1, pageSize = 20, _sort_by, _sort_order } = query

  // TODO: 查询分类下的商品
  return {
    code: 200,
    message: 'success',
    data: {
      category_name: '',
      data: [],
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: 0,
        totalPages: 0
      }
    }
  }
})
