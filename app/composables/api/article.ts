import type { Article, ArticleCategory, ArticleTag } from '~/types/blog'
import type { Pagination } from '~/types/api'

/** 文章列表查询参数 */
export interface ArticleListParams {
  page?: number
  pageSize?: number
  category_id?: number
  keyword?: string
  /** 标签名，支持逗号分隔多值 */
  tag?: string
}

/** 文章搜索参数 */
export interface ArticleSearchParams {
  keyword?: string
  page?: number
  pageSize?: number
}

/**
 * 文章模块 API 封装
 * 前缀: /article
 * 无鉴权要求
 */
export function useArticleApi() {
  const { get } = useApi()

  /**
   * 获取文章列表
   * GET /article/list
   */
  async function list(params?: ArticleListParams) {
    return await get<{ articles: Article[]; pagination: Pagination }>('/article/list', params)
  }

  /**
   * 获取文章详情
   * GET /article/<article_code>
   */
  async function detail(articleCode: string) {
    return await get<Article>(`/article/${articleCode}`)
  }

  /**
   * 获取相关文章
   * GET /article/<article_code>/related
   */
  async function related(articleCode: string, pageSize?: number) {
    return await get<Article[]>(`/article/${articleCode}/related`, { pageSize })
  }

  /**
   * 获取文章分类
   * GET /article/categories
   */
  async function categories() {
    return await get<ArticleCategory[]>('/article/categories')
  }

  /**
   * 获取文章标签
   * GET /article/tags
   */
  async function tags(type?: number) {
    return await get<ArticleTag[]>('/article/tags', type !== undefined ? { type } : undefined)
  }

  /**
   * 获取热门文章
   * GET /article/hot
   */
  async function hot(pageSize?: number) {
    return await get<Article[]>('/article/hot', { pageSize })
  }

  /**
   * 获取最新文章
   * GET /article/latest
   */
  async function latest(pageSize?: number) {
    return await get<Article[]>('/article/latest', { pageSize })
  }

  /**
   * 文章搜索
   * GET /article/search
   */
  async function search(params: ArticleSearchParams) {
    return await get<{ articles: Article[]; pagination: Pagination }>('/article/search', params)
  }

  return { list, detail, related, categories, tags, hot, latest, search }
}
