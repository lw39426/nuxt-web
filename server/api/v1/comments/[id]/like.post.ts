/**
 * 评论点赞接口
 * POST /api/v1/comments/:id/like
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')

  // TODO: 点赞/取消点赞
  return {
    code: 200,
    message: '操作成功',
    data: {
      is_liked: true,
      like_count: 0
    }
  }
})
