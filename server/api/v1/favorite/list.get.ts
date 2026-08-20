import { mockFavoriteProducts, mockFavoriteArticles } from '../../../utils/mock-data'

/**
 * 获取收藏列表接口
 * GET /api/v1/favorite/list
 * 查询参数: page, pageSize, item_type
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page = 1, pageSize = 10, item_type } = query

  // 根据类型返回不同的收藏数据
  let favorites = []
  if (item_type === 'product') {
    favorites = mockFavoriteProducts
  } else if (item_type === 'article') {
    favorites = mockFavoriteArticles
  } else {
    favorites = [...mockFavoriteProducts, ...mockFavoriteArticles]
  }

  return {
    code: 200,
    message: 'success',
    data: {
      favorites,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: favorites.length,
        totalPages: Math.ceil(favorites.length / Number(pageSize))
      }
    }
  }
})
