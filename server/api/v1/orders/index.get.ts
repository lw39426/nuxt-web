/**
 * 获取订单列表接口
 * GET /api/v1/orders
 * 查询参数: page, pageSize, status
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page = 1, pageSize = 10, _status } = query

  // TODO: 查询订单列表
  return {
    code: 200,
    message: 'success',
    data: {
      orders: [],
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: 0,
        totalPages: 0
      }
    }
  }
})
