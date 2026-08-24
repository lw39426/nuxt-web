/**
 * 删除地址接口
 * DELETE /api/v1/user/addresses/:id
 * 写操作，不做 Mock 降级
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return proxyOnly<null>(event, `/user/addresses/${id}`, { method: 'DELETE' })
})
