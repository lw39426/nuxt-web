import { buildCheckinStatus, getMockCheckinSet } from '../../../utils/mockUserState'

/**
 * 每日签到接口
 * POST /api/v1/checkin/do
 * 重复签到返回 409；成功后返回最新状态与本次获得积分
 * 需要鉴权；Mock 模式下写内存，代理模式下转发 Flask
 */
export default defineEventHandler((event) => {
  const userId = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'

  /** Mock 路径：内存写入今日签到 */
  const doMock = () => {
    const set = getMockCheckinSet(userId)
    const today = new Date()
    const todayStr = formatDate(today)
    if (set.has(todayStr)) {
      // 重复签到属于业务语义错误，直接透传
      throw createError({ statusCode: 409, message: '今天已经签到过了' })
    }
    set.add(todayStr)
    const status = buildCheckinStatus(userId)
    // 本次获得积分：按当前连续天数对应的梯度
    return {
      ...status,
      earned_points: status.reward_tiers.find((t) => t.days === status.streak_days)?.points || 5
    }
  }

  return withMockFallback(event, '/checkin/do', doMock, { method: 'POST', body: {} })
})

/** 日期格式化为 YYYY-MM-DD */
function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
