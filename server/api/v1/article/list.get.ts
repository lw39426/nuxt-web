import { getMockArticles } from '../../../utils/mockArticles'

/**
 * 获取文章列表接口
 * GET /api/v1/article/list
 * 查询参数: page, pageSize, category_id, keyword
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const categoryId = query.category_id !== undefined ? Number(query.category_id) : undefined

  return withMockFallback(event, '/article/list', () =>
    getMockArticles({ page, pageSize, category_id: categoryId })
  )
})
