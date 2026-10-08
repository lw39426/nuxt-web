import { getMockArticleTags } from '../../../utils/mockArticles'

/**
 * 文章标签接口
 * GET /api/v1/article/tags
 * 查询参数: type（1-商品 2-文章 3-通用，可选）
 * 优先代理 Flask，失败时降级为 Mock 数据（本地聚合去重后返回）
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const type = query.type !== undefined && query.type !== '' ? Number(query.type) : undefined

  /** 构造标签列表 Mock：按 type 过滤后返回 */
  const buildMock = () => {
    const tags = getMockArticleTags()
    return type !== undefined && !Number.isNaN(type) ? tags.filter((t) => t.type === type) : tags
  }

  return withMockFallback(event, '/article/tags', buildMock)
})
