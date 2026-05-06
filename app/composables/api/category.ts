export interface CategoryNode {
  id: number
  name: string
  children?: CategoryNode[]
}

/**
 * 分类模块 API 封装
 */
export function useCategoryApi() {
  const { get } = useApi()

  /**
   * 获取分类列表（GET /api/v1/product/category/list）
   */
  async function list() {
    return await get<CategoryNode[]>('/product/category/list')
  }

  /**
   * 获取分类下的商品（GET /api/v1/product/category/<id>/products）
   */
  async function products(categoryId: number, page?: number, pageSize?: number) {
    return await get<{ data: any[]; page: number; pageSize: number; total: number }>(
      `/product/category/${categoryId}/products`,
      { page, pageSize }
    )
  }

  return { list, products }
}
