import { getMockStoreCategories } from '../../../../utils/mockStoreData'

/**
 * 获取商品分类树接口
 * GET /api/v1/product/category/list
 */
export default defineEventHandler(() => {
  const categories = getMockStoreCategories().map((cat) => ({
    id: cat.id,
    name: cat.name,
    imageUrl: cat.imageUrl,
    children: []
  }))

  return {
    code: 200,
    message: 'success',
    data: categories
  }
})
