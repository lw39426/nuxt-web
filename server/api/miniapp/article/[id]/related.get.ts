export default defineEventHandler(async (event) => {
  /**
   * 相关文章（Mock）
   */
  const id = Number(event.context.params?.id)
  const data = [
    { id: id + 1, title: '相关主题 A' },
    { id: id + 2, title: '相关主题 B' },
    { id: id + 3, title: '相关主题 C' }
  ]
  return { code: 200, message: 'success', data, timestamp: new Date().toISOString() }
})
