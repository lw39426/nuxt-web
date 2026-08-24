/**
 * 用户登出接口
 * POST /api/v1/auth/logout
 * 后端不可用时仍返回成功，保证前端能正常清理本地登录态
 */
export default defineEventHandler((event) =>
  withMockFallback<null>(event, '/auth/logout', () => null, { body: {} })
)
