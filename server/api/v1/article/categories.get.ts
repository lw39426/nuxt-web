import { getMockArticleCategories } from '../../../utils/mockArticles'

/**
 * 获取文章分类接口
 * GET /api/v1/article/categories
 * 优先代理 Flask，失败时降级为本地 Mock
 */
export default defineEventHandler((event) =>
  withMockFallback(event, '/article/categories', getMockArticleCategories)
)
