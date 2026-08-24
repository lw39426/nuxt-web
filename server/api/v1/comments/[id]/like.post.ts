/**
 * 评论点赞接口
 * POST /api/v1/comments/:id/like
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event).catch(() => ({}))

  return proxyOnly<{ is_liked: boolean; like_count: number }>(event, `/comments/${id}/like`, {
    body: body ?? {}
  })
})
