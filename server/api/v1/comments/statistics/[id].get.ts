import { mockComments } from '../../../../utils/mock-data'

/**
 * 获取文章评论统计接口
 * GET /api/v1/comments/statistics/:id
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''

  /** 构造评论统计 Mock 数据 */
  const buildMock = () => ({
    total: mockComments.filter((item) => item.targetType === 'article').length,
    today: 0
  })

  return withMockFallback(event, `/comments/statistics/${id}`, buildMock)
})
