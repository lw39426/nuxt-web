import { getMockArticleCategories } from '../../../utils/mockArticles'

export default defineEventHandler(() => {
  return {
    code: 200,
    message: 'success',
    data: getMockArticleCategories()
  }
})
