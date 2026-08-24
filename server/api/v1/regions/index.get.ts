import { buildRegionListPayload } from '../../../utils/mockCharacterRegions'

/**
 * 获取地区列表接口
 * GET /api/v1/regions
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) =>
  withMockFallback(event, '/regions', buildRegionListPayload)
)
