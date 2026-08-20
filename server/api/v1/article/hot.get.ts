/**
 * 获取热门文章接口
 * GET /api/v1/article/hot
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const _pageSize = Number(query.pageSize) || 10

  // TODO: 查询热门文章
  return {
    code: 200,
    message: 'success',
    data: []
  }
})
