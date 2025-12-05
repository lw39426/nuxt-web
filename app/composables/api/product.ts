import type { Product } from '~/types/product'

export interface ProductSearchParams {
  q?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  sort?: 'price_asc' | 'price_desc' | 'latest' | 'popular'
  page?: number
  pageSize?: number
  brand?: string[]
  memory?: string[]
}

export interface PageResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

/**
 * 商品模块 API 封装
 */
export function useProductApi() {
  const { get } = useApi()

  /**
   * 获取商品详情（GET /miniapp/api/product/<id>）
   */
  async function getDetail(productId: number) {
    return await get<Product>(`/miniapp/api/product/${productId}`)
  }

  /**
   * 商品搜索（GET /miniapp/api/product/search）
   */
  async function search(params: ProductSearchParams) {
    // Convert array params to comma-separated strings if needed, or let $fetch handle it
    // nuxt $fetch/ofetch handles arrays as repeated params usually (e.g. brand=a&brand=b)
    // But my server implementation expects comma separated strings (e.g. brand=a,b)
    // So I should convert them here.

    const apiParams: any = { ...params }
    if (Array.isArray(params.brand)) {
      apiParams.brand = params.brand.join(',')
    }
    if (Array.isArray(params.memory)) {
      apiParams.memory = params.memory.join(',')
    }

    return await get<PageResult<Product>>('/miniapp/api/product/search', apiParams)
  }

  return { getDetail, search }
}
