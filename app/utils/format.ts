/** 元 -> 格式化价格字符串（如 7999 -> ¥7,999） */
export function formatPrice(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`
}

/** 分 -> 元，返回格式化价格字符串（如 1990 -> ¥19.90） */
export function formatPriceFromCent(cent: number) {
  const yuan = cent / 100
  return `¥${yuan.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** 格式化日期字符串（如 2023-08-15T12:00:00Z -> 2023-08-15） */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/** 格式化日期时间字符串（如 2023-08-15T12:00:00Z -> 2023-08-15 12:00） */
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** 相对时间：刚刚 / 3 分钟前 / 2 小时前 / 3 天前 / 具体日期 */
export function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`
  return formatDate(iso)
}
