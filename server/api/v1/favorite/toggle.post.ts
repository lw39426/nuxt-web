import { createError } from 'h3'

/**
 * 收藏/取消收藏接口（切换）
 * POST /api/v1/favorite/toggle
 * 请求体: { item_type: 'product' | 'article', item_id: number }
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

  // TODO: 切换收藏状态
  return {
    code: 200,
    message: '操作成功',
    data: {
      is_favorited: true
    }
  }
})
