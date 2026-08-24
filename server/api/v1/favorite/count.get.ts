import { mockFavoriteProducts, mockFavoriteArticles } from '../../../utils/mock-data'

/**
 * 获取收藏数量接口
 * GET /api/v1/favorite/count
 * 查询参数: item_type
 * 需要鉴权；优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const itemType = getQuery(event).item_type

  /** 构造收藏数量 Mock 数据 */
  const buildMock = () => {
    if (itemType === 'product') return { count: mockFavoriteProducts.length }
    if (itemType === 'article') return { count: mockFavoriteArticles.length }
    return { count: mockFavoriteProducts.length + mockFavoriteArticles.length }
  }

  return withMockFallback(event, '/favorite/count', buildMock)
})
