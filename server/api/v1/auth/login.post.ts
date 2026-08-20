import { createError } from 'h3'

/**
 * 用户登录接口
 * POST /api/v1/auth/login
 * 请求体: { username: string, password: string }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  // 参数校验
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户名和密码不能为空'
    })
  }

  // TODO: 替换为真实的数据库查询和密码验证
  // 这里使用模拟数据演示
  if (username === 'admin' && password === '123456') {
    return {
      code: 200,
      message: '登录成功',
      data: {
        access_token: 'mock_access_token_' + Date.now(),
        refresh_token: 'mock_refresh_token_' + Date.now(),
        expires_in: 7200,
        user: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: '/avatar.webp'
        }
      }
    }
  }

  throw createError({
    statusCode: 401,
    statusMessage: '用户名或密码错误'
  })
})
