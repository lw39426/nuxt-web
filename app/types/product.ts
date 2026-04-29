// 商品类型定义
export interface Product {
  id: number
  title?: string
  code?: string
  name?: string
  main_image?: string
  sales?: number
  stock?: number
  price: number
  originalPrice?: number
  description?: string
  rating?: number
  reviewCount?: number
  images?: string[]
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
  // 优惠信息
  promotions?: string[]
  highlights?: { icon?: string; text: string }[]
  // 规格选择
  memoryOptions?: string[]
  versionOptions?: string[]
  colorOptions?: { name: string; hex: string }[]
  // 保障类型
  guarantees?: {
    name: string
    description: string
  }[]
  // 购买选项
  services?: {
    id: string
    name: string
    price: number
    originalPrice?: number
    discount?: string
  }[]
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
