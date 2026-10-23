// tests/unit/utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, formatDateTime, formatRelative } from '~/utils/format'

describe('formatPrice', () => {
  it('带 ¥ 符号与千分位', () => {
    expect(formatPrice(0)).toBe('¥0')
    expect(formatPrice(1000)).toBe('¥1,000')
    expect(formatPrice(1234567)).toBe('¥1,234,567')
  })
})

describe('formatDate', () => {
  it('把 ISO 时间格式化为中文日期', () => {
    const out = formatDate('2025-08-04T10:00:00.000Z')
    // 中文环境下为 2025/08/04 或 2025年08月04日，取决于 Node 的 ICU，断言包含关键字段
    expect(out).toContain('2025')
  })

  it('无效日期返回空字符串', () => {
    expect(formatDate('not-a-date')).toBe('')
  })
})

describe('formatDateTime', () => {
  it('格式化为中文日期+时间', () => {
    const out = formatDateTime('2025-08-04T10:30:00.000Z')
    // ICU 输出格式跨环境可能为 "2025/08/04 10:30" 或 "08/04 18:30"，
    // 这里只断言包含月/日/时/分结构，不绑定具体年份。
    expect(out).toMatch(/\d{2}\/\d{2}/) // 月/日
    expect(out).toMatch(/\d{2}:\d{2}/) // 时:分
  })

  it('无效日期返回空字符串', () => {
    expect(formatDateTime('not-a-date')).toBe('')
  })
})

describe('formatRelative', () => {
  it('不到 1 分钟返回 刚刚', () => {
    const now = new Date().toISOString()
    expect(formatRelative(now)).toBe('刚刚')
  })

  it('不到 1 小时返回 N 分钟前', () => {
    const d = new Date(Date.now() - 5 * 60_000).toISOString()
    expect(formatRelative(d)).toBe('5 分钟前')
  })

  it('不到 1 天返回 N 小时前', () => {
    const d = new Date(Date.now() - 3 * 3600_000).toISOString()
    expect(formatRelative(d)).toBe('3 小时前')
  })

  it('不到 30 天返回 N 天前', () => {
    const d = new Date(Date.now() - 10 * 24 * 3600_000).toISOString()
    expect(formatRelative(d)).toBe('10 天前')
  })

  it('超过 30 天回退到 formatDate', () => {
    const d = new Date(Date.now() - 40 * 24 * 3600_000).toISOString()
    expect(formatRelative(d)).toMatch(/\d{4}/)
  })
})
