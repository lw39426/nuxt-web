import { getMockStoreCategories } from '../../../../utils/mockStoreData'

/**
 * 获取商品分类树接口
 * GET /api/v1/product/category/list
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) =>
  withMockFallback(event, '/product/category/list', () =>
    getMockStoreCategories().map((cat) => ({
      id: cat.id,
      name: cat.name,
      imageUrl: cat.imageUrl,
      children: []
    }))
  )
)
