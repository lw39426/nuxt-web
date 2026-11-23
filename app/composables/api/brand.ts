import { useApi } from '~/composables/useApi'
import type { ProductBrand } from '~/types/product'

/** 品牌分页不提供 total/pages，末页由当前页原始条数判定。 */
export interface BrandListResponse {
  list: ProductBrand[]
  pagination?: { page: number; pageSize: number } | null
}

const BRAND_PAGE_SIZE = 50

/** 创建真实品牌列表客户端，复用已有 Nitro 透传路由。 */
export function useBrandApi() {
  const { get } = useApi()

  /** 加载全部启用品牌；满页继续请求，失败时不返回不完整列表。 */
  async function getEnabledBrands(): Promise<ProductBrand[]> {
    const brands = new Map<string, ProductBrand>()

    for (let page = 1; ; page++) {
      const response = await get<BrandListResponse>(
        '/brand/list',
        { status: 1, page, pageSize: BRAND_PAGE_SIZE },
        { suppressErrorToast: true }
      )
      if (!Array.isArray(response?.list)) throw new Error('品牌列表响应格式错误')

      for (const brand of response.list) {
        if (typeof brand?.code !== 'string' || !brand.code.trim()) continue
        brands.set(brand.code, {
          code: brand.code,
          name: typeof brand.name === 'string' && brand.name.trim() ? brand.name : brand.code,
          logo: typeof brand.logo === 'string' ? brand.logo : ''
        })
      }

      if (response.list.length < BRAND_PAGE_SIZE) return [...brands.values()]
    }
  }

  return { getEnabledBrands }
}
