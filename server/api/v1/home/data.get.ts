import { getMockStoreCategories, getMockStoreSeries } from '../../../utils/mockStoreData'
import { getMockArticles } from '../../../utils/mockArticles'

/**
 * 首页聚合数据接口
 * 返回：分类、热销商品、新品、精选文章等首页所需的所有数据
 */
export default defineEventHandler(() => {
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
    code: 200,
    message: 'success',
    data: {
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
})
