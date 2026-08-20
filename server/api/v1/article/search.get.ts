/**
 * 文章搜索接口
 * GET /api/v1/article/search
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { _keyword, page = 1, pageSize = 10 } = query

  // TODO: 实现文章搜索
  return {
    code: 200,
    message: 'success',
    data: {
      articles: [],
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: 0,
        totalPages: 0
      }
    }
  }
})
