import { getMockStoreCategories, getMockStoreSeries } from '../../../utils/mockStoreData'
import { getMockArticles } from '../../../utils/mockArticles'
import { normalizeProductList } from '../../../utils/product'

/**
 * 构造首页聚合数据的 Mock 结果
 * 仅在强制 Mock 或后端不可用时调用
 */
function buildHomeMock() {
  const categories = getMockStoreCategories().map((cat) => ({
    id: cat.id,
    name: cat.name,
    image: cat.imageUrl,
    product_count: 0,
    children: []
  }))

  const seriesList = getMockStoreSeries()

  // 热销商品：取所有系列的前 8 个商品
  const hotProducts = seriesList.flatMap((s) => s.otherProducts.slice(0, 2)).slice(0, 8)

  // 新品推荐：取每个系列的第一个商品
  const newProducts = seriesList
    .map((s) => s.featured)
    .filter(Boolean)
    .slice(0, 6)

  // 精选文章
  const { articles } = getMockArticles({ page: 1, pageSize: 4 })

  return {
    banners: [],
    categories,
    featured: {
      tag_name: '精选推荐',
      products: hotProducts
    },
    hot_products: hotProducts,
    new_products: newProducts,
    articles
  }
}

/**
 * 首页聚合数据接口
 * GET /api/v1/home/data
 * 优先代理 Flask，失败时降级为本地 Mock
 *
 * Flask 聚合接口的商品为 snake_case 原始形状（无 code / main_image / salePrice），
 * 统一经 normalizeProductList 适配为前端 Product 契约后再下发
 */
export default defineEventHandler(async (event) => {
  const res = await withMockFallback(event, '/home/data', buildHomeMock)

  if (res?.data) {
    res.data.hot_products = normalizeProductList(res.data.hot_products)
    res.data.new_products = normalizeProductList(res.data.new_products)
    if (res.data.featured) {
      res.data.featured.products = normalizeProductList(res.data.featured.products)
    }
  }

  return res
})
