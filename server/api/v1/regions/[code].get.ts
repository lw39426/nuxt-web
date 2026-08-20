import { buildRegionDetailPayload } from '../../../utils/mockCharacterRegions'

/**
 * 获取地区详情接口
 * GET /api/v1/regions/:code
 */
export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code') ?? ''
  return {
    code: 200,
    message: 'success',
    data: buildRegionDetailPayload(code)
  }
})
