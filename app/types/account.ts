export interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  phone: string
  avatar: string
  bio: string
  gender: 'male' | 'female' | 'other' | 'secret'
  birthday: string
  location: string
  website: string
  memberLevel: string
  memberPoints: number
  joinedAt: string
}

export interface FavoriteProduct {
  id: string
  title: string
  brand: string
  image: string
  price: number
  originalPrice?: number
  inStock: boolean
  priceDropped: boolean
  category: string
  favoritedAt: string
}

export interface FavoriteArticle {
  id: string
  title: string
  excerpt: string
  cover: string
  author: string
  readMinutes: number
  tag: string
  publishedAt: string
  favoritedAt: string
}

export type OrderStatus = 'pending' | 'shipped' | 'completed' | 'refunding' | 'cancelled'

export interface OrderItem {
  title: string
  image: string
  price: number
  quantity: number
  spec: string
}

export interface Order {
  id: string
  orderNo: string
  status: OrderStatus
  total: number
  createdAt: string
  shop: string
  items: OrderItem[]
}

export interface HistoryEntry {
  id: string
  type: 'product' | 'article'
  title: string
  image: string
  meta: string
  viewedAt: string
}

export type NotificationType = 'order' | 'system' | 'interaction' | 'promotion'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  content: string
  read: boolean
  createdAt: string
}

export interface MyComment {
  id: string
  targetType: 'product' | 'article'
  targetTitle: string
  targetImage: string
  content: string
  rating?: number
  likes: number
  replies: number
  createdAt: string
}

export interface Address {
  id: string
  receiver: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  zipCode: string
  tag: '家' | '公司' | '学校' | '其他'
  isDefault: boolean
}

export interface LoginRecord {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  current: boolean
  loginAt: string
}
