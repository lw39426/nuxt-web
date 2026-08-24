/**
 * 发表评论接口
 * POST /api/v1/comments/create
 * 请求体: { article_id: number, content: string, parent_id?: number }
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.article_id || !body?.content) {
    throw createError({
      statusCode: 400,
      statusMessage: '文章ID和评论内容不能为空'
    })
  }

  return proxyOnly<Record<string, any>>(event, '/comments/create', { body })
})
