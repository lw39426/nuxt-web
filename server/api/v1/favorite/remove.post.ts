import { createError } from 'h3'

/**
 * 移除收藏接口
 * POST /api/v1/favorite/remove
 * 请求体: { item_type: string, item_id: number }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { item_type, item_id } = body

  if (!item_type || !item_id) {
    throw createError({
      statusCode: 400,
      statusMessage: '收藏类型和ID不能为空'
    })
  }

  // TODO: 移除收藏
  return {
    code: 200,
    message: '已移除收藏'
  }
})
