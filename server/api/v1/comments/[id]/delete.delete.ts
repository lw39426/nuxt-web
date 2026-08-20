/**
 * 删除评论接口
 * DELETE /api/v1/comments/:id/delete
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')

  // TODO: 删除评论
  return {
    code: 200,
    message: '评论已删除'
  }
})
