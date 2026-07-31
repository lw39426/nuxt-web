import { getMockArticles } from '../../../utils/mockArticles'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const pageSize = Number(query.pageSize || 10)
  const categoryId = query.category_id !== undefined ? Number(query.category_id) : undefined

  const result = getMockArticles({
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 10,
    category_id: categoryId
  })

  return {
    code: 200,
    message: 'success',
    data: result
  }
})
