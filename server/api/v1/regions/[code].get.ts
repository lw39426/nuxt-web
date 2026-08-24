import { buildRegionDetailPayload } from '../../../utils/mockCharacterRegions'

/**
 * 获取地区详情接口
 * GET /api/v1/regions/:code
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code') ?? ''

  return withMockFallback(event, `/regions/${code}`, () => buildRegionDetailPayload(code))
})
