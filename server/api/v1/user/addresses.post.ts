/**
 * 新增地址接口
 * POST /api/v1/user/addresses
 * 写操作，不做 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.recipient_name || !body?.phone || !body?.address_line) {
    throw createError({ statusCode: 400, statusMessage: '请填写完整的地址信息' })
  }

  return await proxyOnly<Record<string, any>>(event, '/user/addresses', {
    method: 'POST',
    body
  })
})
