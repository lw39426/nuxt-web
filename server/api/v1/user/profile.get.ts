import { mockProfile } from '../../../utils/mock-data'

/**
 * 获取个人资料接口
 * GET /api/v1/user/profile
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) =>
  withMockFallback(event, '/user/profile', () => mockProfile)
)
