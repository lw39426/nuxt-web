/**
 * 搜索中心类型定义（design/nuxt4_search_page_prompt.md）
 *
 * 与文档差异说明：
 * - ProductResult.image / ArticleResult 相关字段按「额外要求 6」改为 emoji 占位（emoji / avatarLetter），
 *   不依赖外部图片资源。
 * - 额外补充 tags / timestamp 字段，用于标签筛选与「最新发布」排序。
 */

export type SearchTab = 'all' | 'product' | 'article'

export type SortKey = 'relevance' | 'latest' | 'hottest' | 'price-asc'

/** 搜索联想项 */
export interface SearchSuggestion {
  id: string
  type: 'product' | 'article'
  title: string
  category?: string
}

/** 搜索直达（高确定性关键词命中的商品卡片） */
export interface SearchDirectItem {
  id: string
  name: string
  description: string
  emoji: string
  price: number
  originalPrice?: number
  /** 命中任意关键词即展示（小写匹配） */
  trigger: string[]
}

/** 产品结果卡片数据 */
export interface ProductResult {
  id: string
  type: 'product'
  name: string
  /** 占位 emoji（不依赖外部图片） */
  emoji: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  /** 月销量 */
  sales: number
  shop: string
  description: string
  tags: string[]
  /** 发布时间戳，用于「最新发布」排序 */
  timestamp: number
}

/** 文章结果卡片数据 */
export interface ArticleResult {
  id: string
  type: 'article'
  title: string
  summary: string
  author: { name: string; avatar: string }
  publishDate: string
  readCount: number
  likeCount: number
  tags: string[]
  category: string
  /** 发布时间戳，用于「最新发布」排序 */
  timestamp: number
}

export type SearchResult = ProductResult | ArticleResult

/** 筛选器状态（types 为空数组时视为「全部」） */
export interface FilterState {
  types: ('product' | 'article')[]
  priceRange: [number, number]
  rating: number | null
  tags: string[]
}

/** 最近搜索项 */
export interface RecentItem {
  id: string
  keyword: string
}

/** 热门搜索项（含排名与搜索次数文案） */
export interface TrendingItem {
  rank: number
  keyword: string
  count: string
}

/** 分类快捷入口 */
export interface CategoryShortcut {
  name: string
  emoji: string
  count: string
  /** 点击后作为关键词搜索 */
  keyword: string
}

/** 右侧推荐 / 空结果推荐的精简商品 */
export interface RecommendationProduct {
  id: string
  name: string
  emoji: string
  price: number
  originalPrice?: number
}

/** 结果头部的已选筛选胶囊 */
export interface FilterChip {
  /** 唯一标识（如 `type:product` / `tag:Vue3` / `price` / `rating`） */
  key: string
  label: string
}
