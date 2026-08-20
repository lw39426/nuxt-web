/**
 * 获取商品详情接口
 * GET /api/v1/product/:code
 */
export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  // TODO: 从数据库查询商品详情
  return {
    code: 200,
    message: 'success',
    data: {
      id: 1,
      code,
      name: '示例商品',
      price: 999,
      original_price: 1299,
      description: '这是一个示例商品',
      images: ['/products/headphones.webp'],
      stock: 100,
      sales: 50,
      category_id: 1,
      status: 1,
      created_at: '2024-01-01 00:00:00'
    }
  }
})
