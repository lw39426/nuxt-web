import { mockProfile } from '../../../utils/mock-data'

/**
 * 获取用户信息接口
 * GET /api/v1/user/info
 * 需要鉴权
 */
export default defineEventHandler(() => {
  // TODO: 根据 token 查询数据库获取真实用户信息
  return {
    code: 200,
    message: 'success',
    data: mockProfile
  }
})
