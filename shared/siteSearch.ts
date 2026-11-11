export type SearchEntryType = 'character' | 'product' | 'article'

export interface SiteSearchItem {
  entry_type: SearchEntryType
  id: string | number
  code: string
  title: string
  subtitle: string | null
  url: string
  highlight: string | null
}

export interface SiteSearchTab {
  entry_type: SearchEntryType
  total: number
  items: SiteSearchItem[]
}

export interface SiteSearchData {
  q: string
  engine: string
  tookMs: number
  page: number
  size: number
  tabs: SiteSearchTab[]
}

export interface SiteSearchResponse {
  code: number
  message?: string
  msg?: string
  data: SiteSearchData | null
}

export const SEARCH_CATEGORIES = {
  character: { label: '角色' },
  product: { label: '商品' },
  article: { label: '文章' }
} as const

export const SEARCH_ERROR_MESSAGE = '搜索失败，请稍后重试'
