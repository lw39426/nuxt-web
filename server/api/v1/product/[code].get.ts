import { getMockProductById, getMockProductList } from '../../../utils/mockStoreData'

/**
 * 获取商品详情接口
 * GET /api/v1/product/:code
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code') || ''

  /**
   * 构造商品详情 Mock 数据
   * code 为纯数字时按 id 精确匹配，否则回退到列表首项
   */
  const buildMock = () => {
    const numericId = Number(code)
    const product = Number.isFinite(numericId) ? getMockProductById(numericId) : null
    return product ?? getMockProductList()[0] ?? null
  }

  return withMockFallback(event, `/product/${code}`, buildMock)
})
