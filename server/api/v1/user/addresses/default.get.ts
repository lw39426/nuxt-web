import { mockAddresses } from '../../../../utils/mock-data'

/**
 * 获取默认地址接口
 * GET /api/v1/user/addresses/default
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) =>
  withMockFallback(event, '/user/addresses/default', () => {
    return mockAddresses.find((a) => a.isDefault) ?? mockAddresses[0] ?? null
  })
)
