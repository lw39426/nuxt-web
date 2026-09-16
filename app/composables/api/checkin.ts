/** 签到奖励梯度 */
export interface CheckinRewardTier {
  days: number
  points: number
}

/** 签到徽章 */
export interface CheckinBadge {
  id: string
  days: number
  name: string
  icon: string
  color: string
  unlocked: boolean
}

/** 签到状态 */
export interface CheckinStatus {
  checked_today: boolean
  streak_days: number
  total_points: number
  /** 已签到日期列表（YYYY-MM-DD） */
  checkin_dates: string[]
  reward_tiers: CheckinRewardTier[]
  badges: CheckinBadge[]
}

/** 签到结果（含本次获得积分） */
export interface CheckinResult extends CheckinStatus {
  earned_points: number
}

/**
 * 签到模块 API 封装
 * 前缀: /checkin
 * 需要鉴权
 */
export function useCheckinApi() {
  const { get, post } = useApi()

  /**
   * 查询签到状态（当月记录、连续天数、积分、徽章）
   * GET /checkin/status
   */
  async function getStatus() {
    return await get<CheckinStatus>('/checkin/status')
  }

  /**
   * 每日签到
   * POST /checkin/do
   * 重复签到服务端返回 409
   */
  async function doCheckin() {
    return await post<CheckinResult>('/checkin/do')
  }

  return { getStatus, doCheckin }
}
