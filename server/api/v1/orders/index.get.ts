import { mockOrders } from '../../../utils/mock-data'

/**
 * 获取订单列表接口
 * GET /api/v1/orders
 * 查询参数: page, pageSize, status
 * 需要鉴权；优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const status = query.status ? String(query.status) : ''

  /** 构造订单列表 Mock 数据：按状态过滤后做内存分页 */
  const buildMock = () => {
    const list = status ? mockOrders.filter((item) => item.status === status) : mockOrders
    const total = list.length
    const start = (page - 1) * pageSize

    return {
      orders: list.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  return withMockFallback(event, '/orders', buildMock)
})
