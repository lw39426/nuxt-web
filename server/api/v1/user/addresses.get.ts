import { mockAddresses } from '../../../utils/mock-data'

/**
 * 获取地址列表接口
 * GET /api/v1/user/addresses
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) =>
  withMockFallback(event, '/user/addresses', () => mockAddresses)
)
