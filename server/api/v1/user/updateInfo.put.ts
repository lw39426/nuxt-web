/**
 * 更新用户信息接口
 * PUT /api/v1/user/updateInfo
 * 写操作，不做 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyOnly<Record<string, any>>(event, '/user/updateInfo', { body })
})
