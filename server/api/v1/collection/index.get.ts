import { getMockCollectedSet } from '../../../utils/mockUserState'
import { getMockProductList } from '../../../utils/mockStoreData'

/**
 * 角色图鉴接口
 * GET /api/v1/collection/index
 * 返回：全量角色 + 收集状态（collected）+ 收集进度
 * 需要鉴权；优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const userId = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'

  const buildMock = () => {
    const collected = getMockCollectedSet(userId)
    const all = getMockProductList()

    const characters = all.map((p) => ({
      id: p.id,
      code: p.code || '',
      name: p.name || p.title || '',
      brand: p.brand,
      character_type: p.character_type || '',
      era: p.era || '',
      rating: p.rating || 0,
      collected: collected.has(p.id)
    }))

    return {
      total: characters.length,
      collected_count: characters.filter((c) => c.collected).length,
      characters
    }
  }

  return withMockFallback(event, '/collection/index', buildMock)
})
