import { getMockProductById } from '../../../utils/mockStoreData'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isFinite(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid product id'
    })
  }

  const data = getMockProductById(id)

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'product not found'
    })
  }

  return {
    code: 200,
    message: 'success',
    data
  }
})
