import { getMockProductList } from '../../../utils/mockStoreData'

/**
 * 商品搜索接口
 * GET /api/v1/product/search
 * 查询参数: page, pageSize, keyword, category_id, min_price, max_price, sort_by, sort_order
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  const keyword = String(query.keyword || '')
    .trim()
    .toLowerCase()

  /** 构造搜索结果 Mock 数据：按关键词过滤后做内存分页 */
  const buildMock = () => {
    let list = getMockProductList()
    if (keyword) {
      list = list.filter((item) => {
        const text = `${item.title || ''}${item.name || ''}${item.brand || ''}`.toLowerCase()
        return text.includes(keyword)
      })
    }

    const total = list.length
    const start = (page - 1) * pageSize

    return {
      products: list.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  return withMockFallback(event, '/product/search', buildMock)
})
