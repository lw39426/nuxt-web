/**
 * 获取相关文章接口
 * GET /api/v1/article/:code/related
 */
export default defineEventHandler(async (event) => {
  const _code = getRouterParam(event, 'code')
  const query = getQuery(event)
  const _pageSize = Number(query.pageSize) || 5

  // TODO: 查询相关文章
  return {
    code: 200,
    message: 'success',
    data: []
  }
})
