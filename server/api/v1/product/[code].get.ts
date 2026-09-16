import { getMockProductById, getMockProductList } from '../../../utils/mockStoreData'

/**
 * 获取商品详情接口
 * GET /api/v1/product/:code
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code') || ''

  /**
   * 构造角色详情 Mock 数据
   * 先按字符串 code 精确匹配（如 CHAR-CONAN-001），code 为纯数字时再按 id 匹配，均未命中回退首项
   */
  const buildMock = () => {
    const list = getMockProductList()
    const numericId = Number(code)
    const product =
      list.find((item) => item.code === code) ??
      (Number.isFinite(numericId) ? getMockProductById(numericId) : null)
    return product ?? list[0] ?? null
  }

  return withMockFallback(event, `/product/${code}`, buildMock)
})
