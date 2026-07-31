import { buildRegionDetailPayload } from '../../../utils/mockCharacterRegions'

export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code')

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'region code is required'
    })
  }

  const data = buildRegionDetailPayload(code)

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'region not found'
    })
  }

  return {
    code: 200,
    message: 'success',
    data
  }
})
