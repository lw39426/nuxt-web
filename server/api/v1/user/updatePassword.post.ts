/**
 * 修改密码接口
 * POST /api/v1/user/updatePassword
 * 写操作，不做 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.old_password || !body?.new_password) {
    throw createError({ statusCode: 400, statusMessage: '旧密码和新密码不能为空' })
  }

  if (String(body.new_password).length < 6) {
    throw createError({ statusCode: 400, statusMessage: '新密码长度不能少于6位' })
  }

  return await proxyOnly<null>(event, '/user/updatePassword', { body })
})
