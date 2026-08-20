import { createError } from 'h3'

/**
 * 刷新 Token 接口
 * POST /api/v1/auth/refreshToken
 * 请求头: Authorization: Bearer <refresh_token>
 */
export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'Authorization')
  const refreshToken = authHeader?.replace('Bearer ', '')

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: '未提供刷新令牌'
    })
  }

  // TODO: 验证 refresh_token 的有效性
  // 这里使用模拟数据演示
  if (refreshToken.startsWith('mock_refresh_token_')) {
    return {
      code: 200,
      message: '刷新成功',
      data: {
        access_token: 'mock_access_token_' + Date.now(),
        expires_in: 7200
      }
    }
  }

  throw createError({
    statusCode: 401,
    statusMessage: '刷新令牌无效或已过期'
  })
})
