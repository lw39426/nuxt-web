import { getMockArticles } from '../../../utils/mockArticles'

/**
 * 文章搜索接口
 * GET /api/v1/article/search
 * 查询参数: keyword, page, pageSize
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const keyword = String(query.keyword || '')
    .trim()
    .toLowerCase()

  /** 构造搜索结果 Mock 数据：按标题/描述过滤后做内存分页 */
  const buildMock = () => {
    const { articles } = getMockArticles({ page: 1, pageSize: 10 })
    const filtered = keyword
      ? articles.filter((item) =>
          `${item.title}${item.description}`.toLowerCase().includes(keyword)
        )
      : articles

    const total = filtered.length
    const start = (page - 1) * pageSize

    return {
      articles: filtered.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  return withMockFallback(event, '/article/search', buildMock)
})
