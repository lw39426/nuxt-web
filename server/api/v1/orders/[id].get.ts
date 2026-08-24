import { mockOrders } from '../../../utils/mock-data'

/**
 * 获取订单详情接口
 * GET /api/v1/orders/:id
 * 需要鉴权；优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''

  /** 构造订单详情 Mock 数据：按 id 或 orderNo 匹配，未命中回退首单 */
  const buildMock = () =>
    mockOrders.find((item) => item.id === id || item.orderNo === id) ?? mockOrders[0] ?? null

  return withMockFallback(event, `/orders/${id}`, buildMock)
})
