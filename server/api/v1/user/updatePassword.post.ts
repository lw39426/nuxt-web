import { createError } from 'h3'

/**
 * 修改密码接口
 * POST /api/v1/user/updatePassword
 * 请求体: { old_password: string, new_password: string }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { old_password, new_password } = body

  if (!old_password || !new_password) {
    throw createError({
      statusCode: 400,
      statusMessage: '旧密码和新密码不能为空'
    })
  }

  if (new_password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: '新密码长度不能少于6位'
    })
  }

  // TODO: 验证旧密码并更新为新密码
  return {
    code: 200,
    message: '密码修改成功'
  }
})
