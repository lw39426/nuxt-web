import { getMockArticles } from '../../../utils/mockArticles'

/**
 * 文章搜索接口
 * GET /api/v1/article/search
 * 查询参数: keyword, page, pageSize, category_id, tag（逗号分隔多值）
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const categoryId =
    query.category_id !== undefined && query.category_id !== ''
      ? Number(query.category_id)
      : undefined
  const tag = String(query.tag || '')
  const keyword = String(query.keyword || '')
    .trim()
    .toLowerCase()

  /** 构造搜索结果 Mock：按关键词过滤后再按分类 / 标签收窄，最后内存分页 */
  const buildMock = () => {
    const { articles } = getMockArticles({ page: 1, pageSize: 10 })
    let filtered = articles
    // 关键词：命中标题或描述
    if (keyword) {
      filtered = filtered.filter((item) =>
        `${item.title}${item.description}`.toLowerCase().includes(keyword)
      )
    }
    // 分类筛选
    if (categoryId !== undefined && !Number.isNaN(categoryId)) {
      filtered = filtered.filter((item) => item.category_id === categoryId)
    }
    // 标签筛选：命中任一标签名即保留
    const tagNames = tag
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (tagNames.length > 0) {
      filtered = filtered.filter((item) => (item.tags || []).some((t) => tagNames.includes(t.name)))
    }

    const total = filtered.length
    const start = (page - 1) * pageSize

    return {
      articles: filtered.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    }
  }

  return withMockFallback(event, '/article/search', buildMock)
})
