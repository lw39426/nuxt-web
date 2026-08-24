/**
 * 获取购物车列表接口
 * GET /api/v1/cart/list
 * 需要鉴权；优先代理 Flask，失败时降级为空购物车（避免页面白屏）
 */
export default defineEventHandler((event) =>
  withMockFallback(event, '/cart/list', () => ({
    items: [],
    total_price: 0
  }))
)
