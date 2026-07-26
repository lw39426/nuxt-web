import type { Product } from '~/types/product'
import type { Pagination } from '~/types/api'

/** 分类树节点 */
export interface CategoryNode {
  id: number
  name: string
  imageUrl?: string
  children: CategoryNode[]
}

/** 分类商品列表查询参数 */
export interface CategoryProductsParams {
  page?: number
  pageSize?: number
  sort_by?: 'create_time' | 'sales' | 'price'
  sort_order?: 'asc' | 'desc'
}

/**
 * 分类模块 API 封装
 * 前缀: /product/category
 * 无鉴权要求
 */
export function useCategoryApi() {
  const { get } = useApi()

  /**
   * 获取商品分类树
   * GET /product/category/list
   */
  async function getProductCateList() {
    return await get<CategoryNode[]>('/product/category/list')
  }

  /**
   * 获取分类下的商品
   * GET /product/category/<category_id>/products
   */
  async function getProducts(categoryId: number, params?: CategoryProductsParams) {
    return await get<{ category_name: string; data: Product[]; pagination: Pagination }>(
      `/product/category/${categoryId}/products`,
      params
    )
  }

  return { getProductCateList, getProducts }
}
