import { mockFavoriteProducts, mockFavoriteArticles } from '../../../utils/mock-data'

/**
 * 获取收藏列表接口
 * GET /api/v1/favorite/list
 * 查询参数: page, pageSize, item_type
 * 需要鉴权；优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const itemType = query.item_type

  /** 构造收藏列表 Mock 数据：按类型筛选后做内存分页 */
  const buildMock = () => {
    let favorites: any[]
    if (itemType === 'product') {
      favorites = mockFavoriteProducts
    } else if (itemType === 'article') {
      favorites = mockFavoriteArticles
    } else {
      favorites = [...mockFavoriteProducts, ...mockFavoriteArticles]
    }

    const total = favorites.length
    const start = (page - 1) * pageSize

    return {
      favorites: favorites.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  return withMockFallback(event, '/favorite/list', buildMock)
})
