import { getMockArticles } from '../../../utils/mockArticles'

/**
 * 获取热门文章接口
 * GET /api/v1/article/hot
 * 优先代理 Flask，失败时降级为 Mock 数据（按浏览量倒序）
 */
export default defineEventHandler((event) => {
  const pageSize = Number(getQuery(event).pageSize) || 10

  /** 构造热门文章 Mock 数据 */
  const buildMock = () => {
    const { articles } = getMockArticles({ page: 1, pageSize: 1000 })
    return [...articles].sort((a, b) => b.views - a.views).slice(0, pageSize)
  }

  return withMockFallback(event, '/article/hot', buildMock)
})
