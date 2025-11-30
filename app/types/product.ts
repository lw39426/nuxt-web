// 商品类型定义
export interface Product {
  id: number
  title: string
  price: number
  originalPrice?: number
  description: string
  rating: number
  reviewCount: number
  images: string[]
  sizes?: string[]
  colors?: { name: string; hex: string }[]
  brand: string
  memory?: string
  screenSize?: string
  screenType?: string
  battery?: string
  protectionClass?: string
  isNew?: boolean
  isSale?: boolean
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
