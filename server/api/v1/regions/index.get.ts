import { buildRegionListPayload } from '../../../utils/mockCharacterRegions'

/**
 * 获取地区列表接口
 * GET /api/v1/regions
 */
export default defineEventHandler(() => {
  return {
    code: 200,
    message: 'success',
    data: buildRegionListPayload()
  }
})
