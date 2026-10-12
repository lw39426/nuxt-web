/**
 * Sitemap 动态 URL 数据源
 * GET /api/__sitemap__/urls
 *
 * 为 sitemap.xml 提供两类动态详情页 URL：
 *  - 角色详情：/products/{code}
 *  - 文章详情：/blog/{code}
 *
 * 数据复用站内 BFF 逻辑（优先 Flask，失败时自动降级 Mock），
 * 保证 sitemap 与页面展示的数据同源，避免产生 404 死链。
 */
export default defineSitemapEventHandler(async (event) => {
  /** 每类最多产出的 URL 数量，防止异常数据导致内存膨胀 */
  const MAX_ITEMS_PER_TYPE = 5000
  /** 单次分页请求条数 */
  const PAGE_SIZE = 200

  /** 角色详情页 URL 收集器 */
  const productUrls: {
    loc: string
    lastmod?: string
    changefreq: 'weekly'
    priority: 0.8
  }[] = []

  /** 文章详情页 URL 收集器 */
  const articleUrls: {
    loc: string
    lastmod?: string
    changefreq: 'monthly'
    priority: 0.6
  }[] = []

  // ==================== 角色详情页 ====================
  for (let page = 1; page <= Math.ceil(MAX_ITEMS_PER_TYPE / PAGE_SIZE); page++) {
    const res = await withMockFallback<{ products: any[] }>(
      event,
      '/product/search',
      () => {
        // 无后端时用全量 Mock 角色做内存分页，保证 sitemap 仍可生成
        const list = getMockProductList()
        const start = (page - 1) * PAGE_SIZE
        return {
          products: list.slice(start, start + PAGE_SIZE),
          pagination: {
            page,
            pageSize: PAGE_SIZE,
            total: list.length,
            pages: Math.ceil(list.length / PAGE_SIZE)
          }
        }
      },
      {
        query: { page, pageSize: PAGE_SIZE },
        // 后端返回 { data: [...] }，Mock 返回 { products: [...] }，此处统一为 products
        transform: (raw: any) => ({
          products: Array.isArray(raw?.data) ? raw.data : raw?.products || []
        })
      }
    )

    const list = res?.data?.products || []
    for (const item of list) {
      const code = String(item?.code || item?.id || '').trim()
      if (!code) continue
      productUrls.push({
        loc: `/products/${code}`,
        lastmod: item?.update_time || item?.create_time || undefined,
        changefreq: 'weekly',
        priority: 0.8
      })
    }

    // 数据已取尽或达到上限时结束分页
    if (list.length < PAGE_SIZE || productUrls.length >= MAX_ITEMS_PER_TYPE) break
  }

  // ==================== 文章详情页 ====================
  for (let page = 1; page <= Math.ceil(MAX_ITEMS_PER_TYPE / PAGE_SIZE); page++) {
    const res = await withMockFallback<{ articles: any[] }>(
      event,
      '/article/list',
      () => getMockArticles({ page, pageSize: PAGE_SIZE }),
      { query: { page, pageSize: PAGE_SIZE } }
    )

    const list = res?.data?.articles || []
    for (const item of list) {
      const code = String(item?.code || item?.id || '').trim()
      if (!code) continue
      articleUrls.push({
        loc: `/blog/${code}`,
        lastmod: item?.update_date || item?.published_date || undefined,
        changefreq: 'monthly',
        priority: 0.6
      })
    }

    if (list.length < PAGE_SIZE || articleUrls.length >= MAX_ITEMS_PER_TYPE) break
  }

  // 静态页 URL 由 @nuxtjs/sitemap 依据 pages 目录自动生成，此处仅补充动态详情页
  return [...productUrls, ...articleUrls]
})
