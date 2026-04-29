import { getSeriesProductsByCategoryId } from '../../../../../utils/mockStoreData'

export default defineEventHandler((event) => {
  const categoryId = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const pageSize = Number(query.pageSize || 10)

  if (!Number.isFinite(categoryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid category id'
    })
  }

  const allProducts = getSeriesProductsByCategoryId(categoryId)
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    code: 200,
    message: 'success',
    data: {
      data: allProducts.slice(start, end),
      page,
      pageSize,
      total: allProducts.length
    }
  }
})
