import { getMockArticles } from '../../../utils/mockArticles'

/**
 * 获取最新文章接口
 * GET /api/v1/article/latest
 * 优先代理 Flask，失败时降级为 Mock 数据（按发布时间倒序）
 */
export default defineEventHandler((event) => {
  const pageSize = Number(getQuery(event).pageSize) || 10

  /** 构造最新文章 Mock 数据 */
  const buildMock = () => {
    const { articles } = getMockArticles({ page: 1, pageSize: 1000 })
    return [...articles]
      .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
      .slice(0, pageSize)
  }

  return withMockFallback(event, '/article/latest', buildMock)
})
