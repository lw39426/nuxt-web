import type { Product } from '~/types/product'
import type { Pagination } from '~/types/api'

/** 商品搜索请求参数 */
export interface ProductSearchParams {
  page?: number
  pageSize?: number
  keyword?: string
  category_id?: number
  min_price?: number
  max_price?: number
  sort_by?: 'create_time' | 'price' | 'sales'
  sort_order?: 'asc' | 'desc'
}

/** 商品搜索响应 */
export interface ProductSearchResult {
  products: Product[]
  pagination: Pagination
}

/** 商品相关推荐请求参数 */
export interface ProductRelatedParams {
  limit?: number
}

/** 商品相关推荐响应 */
export interface ProductRelatedResult {
  product_id: number
  product_code: string
  category_id: number
  related: Product[]
  total: number
}

/**
 * 商品模块 API 封装
 * 前缀: /product
 * 无鉴权要求
 */
export function useProductApi() {
  const { get } = useApi()

  /**
   * 获取商品详情
   * GET /product/<product_code>
   */
  async function getDetail(productCode: string) {
    return await get<Product>(`/product/${productCode.trim()}`)
  }

  /**
   * 获取相关推荐商品
   * GET /product/<product_code>/related
   */
  async function related(productCode: string, params?: ProductRelatedParams) {
    return await get<ProductRelatedResult>(`/product/${productCode.trim()}/related`, params)
  }

  /**
   * 商品搜索
   * GET /product/search
   */
  async function search(params: ProductSearchParams) {
    return await get<ProductSearchResult>('/product/search', params)
  }

  return { getDetail, related, search }
}
