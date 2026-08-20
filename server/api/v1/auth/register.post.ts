import { createError } from 'h3'

/**
 * 用户注册接口
 * POST /api/v1/auth/register
 * 请求体: { username: string, password: string, email?: string }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, email } = body

  // 参数校验
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户名和密码不能为空'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: '密码长度不能少于6位'
    })
  }

  // TODO: 替换为真实的数据库插入逻辑
  // 这里使用模拟数据演示
  return {
    code: 200,
    message: '注册成功',
    data: {
      user_id: Date.now(),
      username,
      email: email || ''
    }
  }
})
