/**
 * 刷新 Token 接口
 * POST /api/v1/auth/refreshToken
 * 请求头: Authorization: Bearer <refresh_token>
 * 认证类接口不做 Mock 降级
 */
export default defineEventHandler(async (event) => {
  if (!resolveAuthToken(event)) {
    throw createError({ statusCode: 401, statusMessage: '未提供刷新令牌' })
  }

  return await proxyOnly<{ access_token: string }>(event, '/auth/refreshToken', { body: {} })
})
