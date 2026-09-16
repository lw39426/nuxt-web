import { buildCheckinStatus } from '../../../utils/mockUserState'

/**
 * 签到状态查询接口
 * GET /api/v1/checkin/status
 * 返回：签到记录、连续天数、累计积分、奖励梯度、已获徽章
 * 需要鉴权；优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  // Mock 模式下以请求 IP 模拟用户维度（未登录也可演示）
  const userId = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
  return withMockFallback(event, '/checkin/status', () => buildCheckinStatus(userId))
})
