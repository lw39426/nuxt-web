import { createError } from 'h3'

/**
 * 发表评论接口
 * POST /api/v1/comments/create
 * 请求体: { article_id: number, content: string, parent_id?: number }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { article_id, content, parent_id = 0 } = body

  if (!article_id || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: '文章ID和评论内容不能为空'
    })
  }

  // TODO: 创建评论
  return {
    code: 200,
    message: '评论发表成功',
    data: {
      id: Date.now(),
      article_id,
      content,
      parent_id,
      user_id: 1,
      created_at: new Date().toISOString()
    }
  }
})
