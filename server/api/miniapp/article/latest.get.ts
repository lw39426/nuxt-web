export default defineEventHandler(async () => {
  /**
   * 最新文章列表（Mock）
   */
  const data = [
    { id: 201, title: '数码潮流趋势', summary: '探索今年热门数码产品与技术变革。' },
    { id: 202, title: '居家收纳指南', summary: '让家更整洁的实用收纳技巧。' },
    { id: 203, title: '跑步入门教程', summary: '如何科学跑步，避免受伤。' }
  ]
  return { code: 200, message: 'success', data, timestamp: new Date().toISOString() }
})
