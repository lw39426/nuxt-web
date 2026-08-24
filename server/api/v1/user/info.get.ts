import { mockProfile } from '../../../utils/mock-data'

/**
 * 获取用户信息接口
 * GET /api/v1/user/info
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) =>
  withMockFallback(event, '/user/info', () => mockProfile)
)
