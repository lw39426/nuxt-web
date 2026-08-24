/**
 * 用户注册接口
 * POST /api/v1/auth/register
 * 请求体: { username: string, password: string, email?: string }
 * 认证类接口不做 Mock 降级
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.username || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: '用户名和密码不能为空' })
  }

  if (String(body.password).length < 6) {
    throw createError({ statusCode: 400, statusMessage: '密码长度不能少于6位' })
  }

  return await proxyOnly<Record<string, any>>(event, '/auth/register', { body })
})
