import {
  getMockStoreCategories,
  getSeriesProductsByCategoryId
} from '../../../../../utils/mockStoreData'

/**
 * 获取分类下的商品接口
 * GET /api/v1/product/category/:id/products
 * 查询参数: page, pageSize, sort_by, sort_order
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20

  /** 构造分类商品 Mock 数据：取该分类下系列商品并做内存分页 */
  const buildMock = () => {
    const categoryId = Number(id)
    const category = getMockStoreCategories().find((item) => item.id === categoryId)
    const list = Number.isFinite(categoryId) ? getSeriesProductsByCategoryId(categoryId) : []
    const total = list.length
    const start = (page - 1) * pageSize

    return {
      category_name: category?.name || '',
      data: list.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  return withMockFallback(event, `/product/category/${id}/products`, buildMock)
})
