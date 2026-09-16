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

/** 角色四维人工评分（0-10 分：人气 / 战力 / 智商 / 颜值） */
export interface CharacterRatings {
  popularity: number
  power: number
  intelligence: number
  charm: number
}

/** 角色人物关系 */
export interface CharacterRelationship {
  name: string
  relation: string
}

/** 角色经典台词 */
export interface CharacterQuote {
  text: string
  scene?: string
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
  /** 综合评分（0-10，角色数据由人工评分） */
  rating?: number
  category_name: string
  tags: ProductTag[]
  create_time: string // ISO8601 UTC
  update_time: string // ISO8601 UTC
  // 新品标记（首页新品推荐接口额外返回）
  is_new?: boolean

  // ===== YouMi 角色图鉴扩展字段（全部可选，纯商品数据可缺失） =====
  /** 出品年代，如 "90年代" */
  era?: string
  /** 角色类型，如 "主角" / "智将" / "反派" */
  character_type?: string
  /** 出处说明，如 "《海贼王》 尾田荣一郎 · 1997" */
  origin?: string
  /** 背景故事（长文本，详情页资料区块使用） */
  background?: string
  /** 能力设定 */
  highlights?: { text: string }[]
  /** 四维人工评分（人气 / 战力 / 智商 / 颜值） */
  ratings?: CharacterRatings
  /** 人物关系 */
  relationships?: CharacterRelationship[]
  /** 经典台词 */
  quotes?: CharacterQuote[]
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
