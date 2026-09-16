import { getMockStoreCategories, getMockProductList } from '../../../utils/mockStoreData'
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

  const allCharacters = getMockProductList()

  // 精选角色：按人气评分排序取前 8（评分数据来自人工录入）
  const featuredCharacters = [...allCharacters]
    .sort((a, b) => (b.ratings?.popularity || 0) - (a.ratings?.popularity || 0))
    .slice(0, 8)

  // 新收录角色：标记 isNew 的前 6 个
  const newProducts = allCharacters.filter((item) => item.isNew).slice(0, 6)

  // 精选文章
  const { articles } = getMockArticles({ page: 1, pageSize: 4 })

  return {
    banners: [],
    categories,
    featured: {
      tag_name: '精选角色',
      products: featuredCharacters
    },
    hot_products: featuredCharacters,
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
