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
  sizes: string[]
  colors: { name: string; hex: string }[]
}
