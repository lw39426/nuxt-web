/**
 * 检查是否已收藏接口
 * POST /api/v1/favorite/check
 * 请求体: { item_type: string, item_id: number }
 * 需要鉴权；属于读语义，后端不可用时降级为「未收藏」
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.item_type || !body?.item_id) {
    throw createError({
      statusCode: 400,
      statusMessage: '收藏类型和ID不能为空'
    })
  }

  return withMockFallback(event, '/favorite/check', () => ({ is_favorited: false }), { body })
})
