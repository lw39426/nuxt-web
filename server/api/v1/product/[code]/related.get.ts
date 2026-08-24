import { getMockProductList } from '../../../../utils/mockStoreData'

/**
 * 获取相关推荐商品接口
 * GET /api/v1/product/:code/related
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code') || ''
  const limit = Number(getQuery(event).limit) || 8

  /** 构造相关商品 Mock 数据：排除自身后截取 limit 条 */
  const buildMock = () => {
    const related = getMockProductList()
      .filter((item) => String(item.id) !== code && item.code !== code)
      .slice(0, limit)

    return {
      product_code: code,
      related,
      total: related.length
    }
  }

  return withMockFallback(event, `/product/${code}/related`, buildMock)
})
