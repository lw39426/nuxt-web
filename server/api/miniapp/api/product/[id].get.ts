import { getMockProducts } from '../../../../utils/mockProducts'
export default defineEventHandler(async (event) => {
  /**
   * 商品详情（Mock）
   */
  const id = Number(event.context.params?.id)

  // Use the shared mock data generator
  const all = getMockProducts()
  const product = all.find((p) => p.id === id)

  const data = product || {
    id,
    title: '未知商品',
    price: 0,
    images: ['/images/placeholder.svg'],
    description: '暂无描述',
    brand: 'Unknown',
    rating: 0,
    reviewCount: 0
  }

  return { code: 200, message: 'success', data, timestamp: new Date().toISOString() }
})
