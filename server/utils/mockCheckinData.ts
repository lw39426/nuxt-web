// Mock 签到模块数据（仅供服务端 Mock 使用）
// 对应后端接口设计：签到记录 / 连续天数 / 积分发放 / 奖励梯度 / 里程碑徽章

/** 签到奖励梯度：连续签到天数 → 奖励积分（断签后重新从第 1 天计） */
export const CHECKIN_REWARD_TIERS = [
  { days: 1, points: 5 },
  { days: 2, points: 5 },
  { days: 3, points: 10 },
  { days: 5, points: 15 },
  { days: 7, points: 20 },
  { days: 14, points: 40 },
  { days: 30, points: 100 }
]

/** 里程碑徽章：达到指定连续天数后发放 */
export const CHECKIN_BADGES = [
  {
    id: 'checkin-7',
    days: 7,
    name: '七日之约',
    icon: 'i-carbon-star-filled',
    color: 'text-amber-400'
  },
  { id: 'checkin-14', days: 14, name: '半月行者', icon: 'i-carbon-moon', color: 'text-purple-400' },
  { id: 'checkin-30', days: 30, name: '月度大师', icon: 'i-carbon-sun', color: 'text-orange-500' },
  { id: 'checkin-100', days: 100, name: '百炼成钢', icon: 'i-carbon-fire', color: 'text-red-500' }
]

/**
 * 计算某连续签到天数可获得的积分（取满足条件的最大梯度）
 * @param streakDays 连续签到天数
 */
export function getRewardPoints(streakDays: number): number {
  let points = 5
  for (const tier of CHECKIN_REWARD_TIERS) {
    if (streakDays >= tier.days) points = tier.points
  }
  return points
}

/**
 * 生成 Mock 签到记录（近 30 天）
 * 策略：从今天往前推，制造"昨天刚签、今天未签"的状态，便于演示签到交互；
 * 其中断签两天（第 3、4 天前未签），用于演示断签后重新计数
 * @returns 已签到日期列表（YYYY-MM-DD）
 */
export function getMockCheckinDates(): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 1; i <= 10; i++) {
    // 跳过 3、4 天前，模拟断签
    if (i === 3 || i === 4) continue
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    dates.push(formatDate(d))
  }
  return dates
}

/**
 * 根据签到记录计算连续签到天数（以"今天或昨天是否签到"为锚点）
 * @param dates 已签到日期集合（YYYY-MM-DD）
 */
export function calcStreakDays(dates: string[]): number {
  const set = new Set(dates)
  const now = new Date()
  // 锚点：今天已签 → 从今天倒数；今天未签 → 从昨天倒数（断签超过 1 天则归零）
  const anchor = new Date(now)
  if (!set.has(formatDate(anchor))) {
    anchor.setDate(anchor.getDate() - 1)
    if (!set.has(formatDate(anchor))) return 0
  }
  let streak = 0
  while (set.has(formatDate(anchor))) {
    streak++
    anchor.setDate(anchor.getDate() - 1)
  }
  return streak
}

/** 日期格式化为 YYYY-MM-DD（本地时区） */
function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
