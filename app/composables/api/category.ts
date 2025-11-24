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
   * 获取分类列表（GET /miniapp/api/category/list）
   */
  async function list() {
    return await get<CategoryNode[]>('/miniapp/api/category/list')
  }

  /**
   * 获取分类下的商品（GET /miniapp/api/category/<id>/products）
   */
  async function products(categoryId: number, page?: number, pageSize?: number) {
    return await get<{ items: any[]; page: number; pageSize: number; total: number }>(
      `/miniapp/api/category/${categoryId}/products`,
      { page, pageSize }
    )
  }

  return { list, products }
}
