/**
 * 设置默认地址接口
 * PUT /api/v1/user/addresses/:id/setDefault
 * 写操作，不做 Mock 降级
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return proxyOnly<null>(event, `/user/addresses/${id}/setDefault`, {
    method: 'PUT',
    body: {}
  })
})
