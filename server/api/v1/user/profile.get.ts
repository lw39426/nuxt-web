/**
 * 获取个人资料接口
 * GET /api/v1/user/profile
 * 需要鉴权
 */
export default defineEventHandler(() => {
  // TODO: 根据 token 查询数据库获取真实用户资料
  return {
    code: 200,
    message: 'success',
    data: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      phone: '138****8888',
      gender: 1,
      avatar: '/avatar.webp',
      description: '这个人很懒，什么都没留下',
      enable: 1,
      birthday: '1990-01-01',
      create_at: '2024-01-01 00:00:00'
    }
  }
})
