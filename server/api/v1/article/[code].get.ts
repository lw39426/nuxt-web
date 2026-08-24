import { getMockArticles } from '../../../utils/mockArticles'

/**
 * 获取文章详情接口
 * GET /api/v1/article/:code
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code') || ''

  /** 构造文章详情 Mock 数据：按 code 或 id 匹配，未命中回退首篇 */
  const buildMock = () => {
    const { articles } = getMockArticles({ page: 1, pageSize: 1000 })
    return (
      articles.find((item) => item.code === code || String(item.id) === code) ?? articles[0] ?? null
    )
  }

  return withMockFallback(event, `/article/${code}`, buildMock)
})
