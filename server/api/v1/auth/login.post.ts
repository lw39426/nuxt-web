/**
 * 用户登录接口
 * POST /api/v1/auth/login
 * 请求体: { username: string, password: string }
 * 认证类接口不做 Mock 降级，避免伪造登录态
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.username || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: '用户名和密码不能为空' })
  }

  return await proxyOnly<Record<string, any>>(event, '/auth/login', { body })
})
