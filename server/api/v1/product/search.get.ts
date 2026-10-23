import { getMockProductList } from '../../../utils/mockStoreData'
import { normalizeProductList } from '../../../utils/product'

/**
 * 角色（商品）搜索接口
 * GET /api/v1/product/search
 * 查询参数: page, pageSize, keyword, category_id, brand, era, tag, character_type, min_price, max_price, sort_by, sort_order
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  const keyword = String(query.keyword || '')
    .trim()
    .toLowerCase()
  // 复用 brand 承载作品（IP）维度
  const brands = toArray(query.brand)
  const eras = toArray(query.era)
  const tags = toArray(query.tag)
  const characterTypes = toArray(query.character_type)

  /** 将查询参数值归一化为字符串数组（支持单值与逗号分隔多值） */
  function toArray(value: unknown): string[] {
    if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean)
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    }
    return []
  }

  /** 构造搜索结果 Mock 数据：按关键词与筛选维度过滤后做内存分页 */
  const buildMock = () => {
    let list = getMockProductList()
    if (keyword) {
      list = list.filter((item) => {
        const text = `${item.title || ''}${item.name || ''}${item.brand || ''}${
          item.description || ''
        }${item.character_type || ''}${item.origin || ''}`.toLowerCase()
        return text.includes(keyword)
      })
    }
    // 作品（IP）筛选：复用 brand 字段
    if (brands.length > 0) {
      list = list.filter((item) => brands.includes(item.brand))
    }
    // 年代筛选
    if (eras.length > 0) {
      list = list.filter((item) => eras.includes(item.era || ''))
    }
    // 角色类型筛选
    if (characterTypes.length > 0) {
      list = list.filter((item) => characterTypes.includes(item.character_type || ''))
    }
    // 标签筛选：命中任一标签即保留
    if (tags.length > 0) {
      list = list.filter((item) =>
        (item.tags || []).some((tag: { name: string }) => tags.includes(tag.name))
      )
    }

    // 排序：四维评分维度取 ratings 内对应字段，缺失按 0 处理；create_time / price / sales 走顶层字段
    const sortBy = String(query.sort_by || '')
    if (sortBy) {
      const dimKey = sortBy as 'popularity' | 'power' | 'intelligence' | 'charm'
      const ratingDims = ['popularity', 'power', 'intelligence', 'charm']
      const sortOrder = String(query.sort_order || 'desc') === 'asc' ? 1 : -1
      list = [...list].sort((a, b) => {
        let va: number
        let vb: number
        if (ratingDims.includes(dimKey)) {
          va = (a.ratings?.[dimKey] as number) || 0
          vb = (b.ratings?.[dimKey] as number) || 0
        } else {
          va = Number(a[sortBy]) || 0
          vb = Number(b[sortBy]) || 0
        }
        return (va - vb) * sortOrder
      })
    }

    const total = list.length
    const start = (page - 1) * pageSize

    return {
      products: normalizeProductList(list.slice(start, start + pageSize)),
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    }
  }

  return withMockFallback(event, '/product/search', buildMock, {
    /**
     * 后端响应归一化：Flask 返回 { data: [...], pagination }
     * 前端契约（及 Mock）为 { products: [...], pagination }，此处对齐
     */
    transform: (backendData: any) => ({
      products: normalizeProductList(
        Array.isArray(backendData?.data) ? backendData.data : backendData?.products || []
      ),
      pagination: backendData?.pagination || {
        page,
        pageSize,
        total: Array.isArray(backendData?.data) ? backendData.data.length : 0,
        pages: 1
      }
    })
  })
})
