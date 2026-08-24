/**
 * 移除收藏接口
 * POST /api/v1/favorite/remove
 * 请求体: { item_type: string, item_id: number }
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

  return proxyOnly<null>(event, '/favorite/remove', { body })
})
