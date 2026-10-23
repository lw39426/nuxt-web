import type { Product, ProductBrand } from '~/types/product'

/** 品牌字段归一化：兼容字符串 / 对象 / null 三种历史形态 */
export function normalizeProductBrand(raw: unknown): ProductBrand | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    const name = raw.trim()
    return name ? { code: '', name, logo: '' } : null
  }
  if (typeof raw === 'object') {
    const brand = raw as Record<string, unknown>
    const name = String(brand.name || '').trim()
    if (!name) return null
    return {
      code: String(brand.code || '').trim(),
      name,
      logo: String(brand.logo || '').trim()
    }
  }
  return null
}

/**
 * 商品对象规范化：适配 Flask 接口的 snake_case 与前端 Product 契约
 *
 * 后端契约（2026-10）：不保证下发 id，业务标识统一使用 code；
 * brand 为 { code, name, logo } | null；price / salePrice 单位为分。
 * 旧接口仍可能返回字符串 brand 与数字 id，此处做兼容归一化。
 */
export function normalizeProduct(raw: Record<string, any>): Product {
  const id = raw?.id
  const image = raw?.main_image || raw?.image || ''
  return {
    ...(id != null ? { id: Number(id) } : {}),
    code: raw?.code || (id != null ? `prd_${id}` : ''),
    name: raw?.name || raw?.title || '',
    description: raw?.description || '',
    price: Number(raw?.price) || 0,
    salePrice: Number(raw?.sale_price ?? raw?.salePrice ?? raw?.originalPrice ?? 0) || 0,
    stock: Number(raw?.stock) || 0,
    category_id: raw?.category_id ?? 0,
    category_name: raw?.category_name || '',
    status: raw?.status ?? 1,
    main_image: image,
    images: Array.isArray(raw?.images) && raw.images.length > 0 ? raw.images : image ? [image] : [],
    detail_html: raw?.detail_html || '',
    sales: Number(raw?.sales) || 0,
    sort: raw?.sort ?? 0,
    brand: normalizeProductBrand(raw?.brand),
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    create_time: raw?.create_time || '',
    update_time: raw?.update_time || '',
    is_new: raw?.is_new ?? raw?.isNew,
    ...(raw?.favorite_count != null || raw?.reviewCount != null
      ? { favorite_count: Number(raw.favorite_count ?? raw.reviewCount) || 0 }
      : {}),
    rating: raw?.rating != null ? Number(raw.rating) : undefined,
    // YouMi 角色图鉴扩展字段透传（后端未返回时保留 undefined，不影响纯商品数据）
    era: raw?.era,
    character_type: raw?.character_type,
    origin: raw?.origin,
    background: raw?.background,
    highlights: Array.isArray(raw?.highlights) ? raw.highlights : undefined,
    ratings: raw?.ratings,
    relationships: Array.isArray(raw?.relationships) ? raw.relationships : undefined,
    quotes: Array.isArray(raw?.quotes) ? raw.quotes : undefined
  } as Product
}

/** 批量规范化；非数组输入返回空数组，保证下游 v-for 安全 */
export function normalizeProductList(list: unknown): Product[] {
  return Array.isArray(list) ? list.map((item) => normalizeProduct(item)) : []
}
