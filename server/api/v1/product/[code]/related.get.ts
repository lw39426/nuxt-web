import { getMockProductList } from '../../../../utils/mockStoreData'
import { normalizeProductList } from '../../../../utils/product'

/**
 * 获取相关推荐商品接口
 * GET /api/v1/product/:code/related
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code') || ''
  const limit = Number(getQuery(event).limit) || 8

  /**
   * 构造相关角色 Mock 数据：
   * 优先推荐同作品（brand）角色，不足时补齐其他角色，排除自身后截取 limit 条
   */
  const buildMock = () => {
    const list = getMockProductList()
    const self = list.find((item) => String(item.id) === code || item.code === code)
    const excludeSelf = (item: (typeof list)[number]) =>
      String(item.id) !== code && item.code !== code

    // 同作品（IP）角色优先
    const sameBrand = self
      ? list.filter((item) => excludeSelf(item) && item.brand === self.brand)
      : []
    // 其他作品角色补齐
    const others = list.filter((item) => excludeSelf(item) && item.brand !== self?.brand)
    const related = normalizeProductList([...sameBrand, ...others].slice(0, limit))

    return {
      product_code: code,
      related,
      total: related.length
    }
  }

  const res = await withMockFallback(event, `/product/${code}/related`, buildMock)
  if (res.data?.related) {
    res.data.related = normalizeProductList(res.data.related)
  }
  return res
})
