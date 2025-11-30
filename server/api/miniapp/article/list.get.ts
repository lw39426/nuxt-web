export default defineEventHandler(async (event) => {
  /**
   * 文章列表查询（Mock），支持 q、sort、page、pageSize
   */
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const pageSize = Number(query.pageSize || 12)
  const q = String(query.q || '').toLowerCase()
  const sort = String(query.sort || '') as 'latest' | 'hot' | ''

  let items = [
    { id: 201, title: '数码潮流趋势', summary: '探索今年热门数码产品与技术变革。' },
    { id: 202, title: '居家收纳指南', summary: '让家更整洁的实用收纳技巧。' },
    { id: 203, title: '跑步入门教程', summary: '如何科学跑步，避免受伤。' },
    { id: 204, title: '彩妆新手必看', summary: '五分钟打造日常通勤妆。' }
  ]

  if (q)
    items = items.filter(
      (a) => a.title.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q)
    )
  if (sort === 'latest') items = items.sort((a, b) => b.id - a.id)

  const total = items.length
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)
  return {
    code: 200,
    message: 'success',
    data: { items: pageItems, page, pageSize, total },
    timestamp: new Date().toISOString()
  }
})
