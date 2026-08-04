/**
 * 商品类型定义
 * 对应接口文档中的 Product 数据模型
 * 价格单位：分（整数），前端展示时 /100 转换为元
 */

/** 商品标签 */
export interface ProductTag {
  id: number
  name: string
  color: string
  weight: number
}

/** 商品对象 */
export interface Product {
  id: number
  code: string
  name: string
  description: string
  price: number
  salePrice: number
  stock: number
  category_id: number
  status: number // 0-下架，1-上架
  main_image: string
  images: string[]
  detail_html: string
  sales: number
  sort: number
  brand: string
  favorite_count: number
  category_name: string
  tags: ProductTag[]
  create_time: string // ISO8601 UTC
  update_time: string // ISO8601 UTC
  // 新品标记（首页新品推荐接口额外返回）
  is_new?: boolean
}

export interface FilterOption {
  label: string
  value: string | number
  count?: number
}

export interface ProductFilters {
  priceRange: [number, number]
  brands: string[]
  memory: string[]
  protectionClass: string[]
  screenDiagonal: string[]
  screenType: string[]
  batteryCapacity: string[]
}
