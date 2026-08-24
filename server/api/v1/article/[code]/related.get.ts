import { getMockArticles } from '../../../../utils/mockArticles'

/**
 * 获取相关文章接口
 * GET /api/v1/article/:code/related
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code') || ''
  const pageSize = Number(getQuery(event).pageSize) || 5

  /** 构造相关文章 Mock 数据：同分类优先，排除自身后截取 */
  const buildMock = () => {
    const { articles } = getMockArticles({ page: 1, pageSize: 1000 })
    const current = articles.find((item) => item.code === code || String(item.id) === code)
    const pool = current
      ? articles.filter(
          (item) => item.category_id === current.category_id && item.id !== current.id
        )
      : articles

    return pool.slice(0, pageSize)
  }

  return withMockFallback(event, `/article/${code}/related`, buildMock)
})
