import { getMockArticles } from '../../../utils/mockArticles'

/**
 * 获取文章列表接口
 * GET /api/v1/article/list
 * 查询参数: page, pageSize, category_id, keyword
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page = 1, pageSize = 10, _category_id, _keyword } = query

  // 使用模拟数据
  const result = getMockArticles({
    page: Number(page),
    pageSize: Number(pageSize)
  })

  return {
    code: 200,
    message: 'success',
    data: result
  }
})
