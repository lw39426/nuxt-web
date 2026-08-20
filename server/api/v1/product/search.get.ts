/**
 * 商品搜索接口
 * GET /api/v1/product/search
 * 查询参数: page, pageSize, keyword, category_id, min_price, max_price, sort_by, sort_order
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const {
    page = 1,
    pageSize = 20,
    _keyword,
    _category_id,
    _min_price,
    _max_price,
    _sort_by,
    _sort_order
  } = query

  // TODO: 实现商品搜索逻辑
  return {
    code: 200,
    message: 'success',
    data: {
      products: [],
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: 0,
        totalPages: 0
      }
    }
  }
})
