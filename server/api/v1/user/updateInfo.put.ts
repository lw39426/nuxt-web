/**
 * 更新用户信息接口
 * PUT /api/v1/user/updateInfo
 * 请求体: { nickname?: string, gender?: number, birthday?: string, description?: string }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nickname, gender, birthday, description } = body

  // TODO: 更新数据库中的用户信息
  return {
    code: 200,
    message: '更新成功',
    data: {
      nickname: nickname || '',
      gender: gender || 0,
      birthday: birthday || '',
      description: description || ''
    }
  }
})
