/**
 * 获取文章评论列表接口
 * GET /api/v1/comments/article/:id
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')

  // TODO: 查询文章评论
  return {
    code: 200,
    message: 'success',
    data: {
      comments: [],
      total: 0
    }
  }
})
