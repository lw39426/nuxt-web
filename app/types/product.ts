/**
 * 商品类型定义
 * 对应接口文档中的 Product 数据模型
 * 价格单位：分（展示时使用 formatPriceFromCent）
 */

/** 商品标签 */
export interface ProductTag {
  id: number
  name: string
  color: string
  weight: number
}

/** 商品品牌 */
export interface ProductBrand {
  code: string
  name: string
  logo: string
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
  /** 兼容旧收藏接口的内部主键；新后端商品对象不再下发，业务标识统一使用 code */
  id?: number
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
  brand: ProductBrand | null
  /** 仅商品详情接口注入，列表/搜索/分类/首页不保证返回 */
  favorite_count?: number
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

/** 角色作品分类 */
export interface ProductCategory {
  id: number
  name: string
  image: string
}

/** 角色系列分组 */
export interface ProductSeriesGroup {
  categoryId: number
  category: string
  categoryImage: string
  products: Product[]
  /** 该系列角色总数（分页 total，可能大于已加载数量） */
  total: number
}

/** 角色筛选维度 */
export type ProductFilterKey = 'character_type' | 'era' | 'tag'

/** 筛选维度候选项 */
export interface ProductFilterOptionGroup {
  key: ProductFilterKey
  label: string
  options: string[]
}

/** 已选筛选标签 */
export interface ProductActiveFilterTag {
  key: ProductFilterKey
  label: string
  value: string
}

/** 筛选状态 */
export type ProductCatalogFilters = Record<ProductFilterKey, string[]>

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
