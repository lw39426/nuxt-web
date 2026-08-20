/**
 * 获取文章详情接口
 * GET /api/v1/article/:code
 */
export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  // TODO: 从数据库查询文章详情
  return {
    code: 200,
    message: 'success',
    data: {
      id: 1,
      code,
      title: '示例文章',
      content: '这是文章内容...',
      author: '作者',
      category_id: 1,
      tags: [],
      views: 100,
      likes: 10,
      created_at: '2024-01-01 00:00:00'
    }
  }
})
