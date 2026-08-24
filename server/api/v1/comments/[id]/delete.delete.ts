/**
 * 删除评论接口
 * DELETE /api/v1/comments/:id/delete
 * 需要鉴权；写操作仅代理 Flask，不允许 Mock 降级
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  return proxyOnly<null>(event, `/comments/${id}/delete`, { method: 'DELETE' })
})
