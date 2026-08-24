/**
 * 编辑地址接口
 * PUT /api/v1/user/addresses/:id
 * 写操作，不做 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  return await proxyOnly<Record<string, any>>(event, `/user/addresses/${id}`, {
    method: 'PUT',
    body
  })
})
