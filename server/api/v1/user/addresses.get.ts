import { mockAddresses } from '../../../utils/mock-data'

/**
 * 获取地址列表接口
 * GET /api/v1/user/addresses
 * 需要鉴权
 */
export default defineEventHandler(() => {
  // TODO: 根据用户ID查询地址列表
  return {
    code: 200,
    message: 'success',
    data: mockAddresses
  }
})
