export default defineEventHandler(async (event) => {
  /**
   * 文章详情（Mock）
   */
  const id = Number(event.context.params?.id)
  const detail = {
    id,
    title: `示例文章 ${id}`,
    summary: '这是一篇示例文章摘要。',
    content: '<p>这里是完整文章内容的 HTML 示例。</p><p>可包含图片、列表等富文本。</p>'
  }
  return { code: 200, message: 'success', data: detail, timestamp: new Date().toISOString() }
})
