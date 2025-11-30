export interface ArticleBrief {
  id: number
  title: string
  summary?: string
  categoryId?: number
  tags?: string[]
}

export interface ArticleDetail extends ArticleBrief {
  content: string
  views?: number
  likes?: number
}

export interface ArticleQuery {
  page?: number
  pageSize?: number
  categoryId?: number
  q?: string
  sort?: 'latest' | 'hot'
}

/**
 * 文章模块 API 封装
 */
export function useArticleApi() {
  const { get } = useApi()

  /**
   * 列表查询（GET /miniapp/article/list）
   */
  async function list(params: ArticleQuery) {
    return await get<{ items: ArticleBrief[]; page: number; pageSize: number; total: number }>(
      '/miniapp/article/list',
      params as any
    )
  }

  /**
   * 文章详情（GET /miniapp/article/<id>）
   */
  async function detail(articleId: number) {
    return await get<ArticleDetail>(`/miniapp/article/${articleId}`)
  }

  /**
   * 相关文章（GET /miniapp/article/<id>/related）
   */
  async function related(articleId: number) {
    return await get<ArticleBrief[]>(`/miniapp/article/${articleId}/related`)
  }

  /**
   * 分类列表（GET /miniapp/article/categories）
   */
  async function categories() {
    return await get<{ id: number; name: string; children?: any[] }[]>(
      '/miniapp/article/categories'
    )
  }

  /**
   * 标签列表（GET /miniapp/article/tags）
   */
  async function tags() {
    return await get<string[]>('/miniapp/article/tags')
  }

  /**
   * 热门文章（GET /miniapp/article/hot）
   */
  async function hot() {
    return await get<ArticleBrief[]>('/miniapp/article/hot')
  }

  /**
   * 最新文章（GET /miniapp/article/latest）
   */
  async function latest() {
    return await get<ArticleBrief[]>('/miniapp/article/latest')
  }

  /**
   * 搜索（GET /miniapp/article/search）
   */
  async function search(params: { q?: string; page?: number; pageSize?: number }) {
    return await get<{ items: ArticleBrief[]; page: number; pageSize: number; total: number }>(
      '/miniapp/article/search',
      params
    )
  }

  return { list, detail, related, categories, tags, hot, latest, search }
}
