export interface Product {
  id: number
  name: string
  price: number
  cover?: string
  categoryId?: number
}

export interface ProductSearchParams {
  q?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  sort?: 'price_asc' | 'price_desc' | 'latest' | 'popular'
  page?: number
  pageSize?: number
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
    return await get<PageResult<Product>>('/miniapp/api/product/search', params as any)
  }

  return { getDetail, search }
}
