/**
 * 用户登出接口
 * POST /api/v1/auth/logout
 */
export default defineEventHandler(async () => {
  // TODO: 清除 Redis/数据库中的 token 缓存
  return {
    code: 200,
    message: '登出成功'
  }
})
