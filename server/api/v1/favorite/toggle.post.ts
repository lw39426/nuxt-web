/**
 * 收藏/取消收藏接口（切换）
 * POST /api/v1/favorite/toggle
 * 请求体: { item_type: 'product' | 'article', item_id: number }
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.item_type || !body?.item_id) {
    throw createError({
      statusCode: 400,
      statusMessage: '收藏类型和ID不能为空'
    })
  }

  return proxyOnly<{ is_favorited: boolean }>(event, '/favorite/toggle', { body })
})
