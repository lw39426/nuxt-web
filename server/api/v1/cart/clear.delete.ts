/**
 * 清空购物车接口
 * DELETE /api/v1/cart/clear
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler((event) =>
  proxyOnly<null>(event, '/cart/clear', { method: 'DELETE' })
)
