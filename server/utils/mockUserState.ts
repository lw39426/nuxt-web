// 签到与图鉴模块共享的内存状态（仅供服务端 Mock 使用）
// 注意：Nitro 不允许 server/api 路由文件之间相互导入，
// 共享的内存态与工具函数统一放在 server/utils 下，由各路由导入

import {
  getMockCheckinDates,
  calcStreakDays,
  CHECKIN_REWARD_TIERS,
  CHECKIN_BADGES
} from './mockCheckinData'
import { getMockProductList } from './mockStoreData'

/** 日期格式化为 YYYY-MM-DD（本地时区） */
function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Mock 模式下的内存签到状态（按用户隔离，dev 演示用，重启即失） */
const checkinStore = new Map<string, Set<string>>()

/** 获取某用户的签到日期集合（Mock，首次访问初始化演示数据） */
export function getMockCheckinSet(userId: string): Set<string> {
  if (!checkinStore.has(userId)) {
    checkinStore.set(userId, new Set(getMockCheckinDates()))
  }
  return checkinStore.get(userId)!
}

/** 构造签到状态响应体（签到记录 / 连续天数 / 累计积分 / 徽章解锁态） */
export function buildCheckinStatus(userId: string) {
  const dates = [...getMockCheckinSet(userId)]
  const streak = calcStreakDays(dates)
  // 累计积分：每次签到按平均 8 分估算（演示用）
  const totalPoints = dates.length * 8
  const todayStr = formatDate(new Date())

  return {
    checked_today: dates.includes(todayStr),
    streak_days: streak,
    total_points: totalPoints,
    checkin_dates: dates,
    reward_tiers: CHECKIN_REWARD_TIERS,
    badges: CHECKIN_BADGES.map((b) => ({
      ...b,
      unlocked: streak >= b.days
    }))
  }
}

/** Mock 模式下的内存收集状态（按用户隔离，dev 演示用，重启即失） */
const collectedStore = new Map<string, Set<number>>()

/** 获取某用户的已收集角色 id 集合（Mock，首次访问初始化：前 12 个角色 + 柯南系列） */
export function getMockCollectedSet(userId: string): Set<number> {
  if (!collectedStore.has(userId)) {
    const initial = new Set<number>(
      getMockProductList()
        .slice(0, 12)
        .map((p) => p.id)
    )
    for (let i = 1; i <= 4; i++) initial.add(i)
    collectedStore.set(userId, initial)
  }
  return collectedStore.get(userId)!
}
