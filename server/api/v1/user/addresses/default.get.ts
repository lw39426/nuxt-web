import { mockAddresses } from '../../../../utils/mock-data'

/**
 * 获取默认地址接口
 * GET /api/v1/user/addresses/default
 * 需要鉴权
 */
export default defineEventHandler(() => {
  // TODO: 查询默认地址
  const defaultAddress = mockAddresses.find((addr) => addr.is_default) || mockAddresses[0]

  return {
    code: 200,
    message: 'success',
    data: defaultAddress
  }
})
