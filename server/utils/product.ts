import type { Product } from '~/types/product'

/**
 * 商品对象规范化：把 Flask /home/data 等聚合接口返回的 snake_case 商品
 * 适配为前端 Product 契约（types/product.ts）
 *
 * 注意：Flask 聚合接口不下发 code，但全部列表/详情接口的 code 均遵循
 * `prd_{id}` 规律（实测 /product/search 全量商品 15/15 命中），
 * 缺失时按此补全，否则商品卡无法加购（/cart/add 以 product_code 定位商品）。
 */
export function normalizeProduct(raw: Record<string, any>): Product {
  const id = raw?.id
  const image = raw?.main_image || raw?.image || ''
  return {
    id: id ?? 0,
    code: raw?.code || (id != null ? `prd_${id}` : ''),
    name: raw?.name || raw?.title || '',
    description: raw?.description || '',
    price: Number(raw?.price) || 0,
    salePrice: Number(raw?.sale_price ?? raw?.salePrice ?? raw?.originalPrice ?? 0) || 0,
    stock: Number(raw?.stock) || 0,
    category_id: raw?.category_id ?? 0,
    status: raw?.status ?? 1,
    main_image: image,
    images: Array.isArray(raw?.images) && raw.images.length > 0 ? raw.images : image ? [image] : [],
    detail_html: raw?.detail_html || '',
    sales: Number(raw?.sales) || 0,
    sort: raw?.sort ?? 0,
    brand: raw?.brand || '',
    tags: Array.isArray(raw?.tags) ? raw.tags : []
  } as Product
}

/** 批量规范化；非数组输入返回空数组，保证下游 v-for 安全 */
export function normalizeProductList(list: unknown): Product[] {
  return Array.isArray(list) ? list.map((item) => normalizeProduct(item)) : []
}
