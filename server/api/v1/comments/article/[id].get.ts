import { mockComments } from '../../../../utils/mock-data'

/**
 * 获取文章评论列表接口
 * GET /api/v1/comments/article/:id
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''

  /** 构造文章评论 Mock 数据 */
  const buildMock = () => {
    const comments = mockComments.filter((item) => item.targetType === 'article')
    return {
      article_id: id,
      comments,
      total: comments.length
    }
  }

  return withMockFallback(event, `/comments/article/${id}`, buildMock)
})
