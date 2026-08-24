/**
 * 清空收藏接口
 * POST /api/v1/favorite/clear
 * 请求体: { item_type?: string }
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))

  return proxyOnly<null>(event, '/favorite/clear', { body: body ?? {} })
})
