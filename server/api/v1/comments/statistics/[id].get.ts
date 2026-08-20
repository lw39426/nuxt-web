/**
 * 获取文章评论统计接口
 * GET /api/v1/comments/statistics/:id
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')

  // TODO: 查询评论统计
  return {
    code: 200,
    message: 'success',
    data: {
      total: 0,
      today: 0
    }
  }
})
