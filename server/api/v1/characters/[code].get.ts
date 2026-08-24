import { MOCK_CHARACTER_REGIONS } from '../../../utils/mockCharacterRegions'

/**
 * 获取角色详情接口
 * GET /api/v1/characters/:code
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code') || ''

  /** 构造角色详情 Mock 数据：按 id 或名称匹配 */
  const buildMock = () => {
    for (const region of MOCK_CHARACTER_REGIONS) {
      const char = region.characters.find((item) => String(item.id) === code || item.name === code)
      if (!char) continue

      return {
        id: char.id,
        name: char.name,
        element: char.element,
        cv_cn: char.cv_cn,
        cv_jp: char.cv_jp,
        quote: char.quote,
        description: char.description,
        avatar_url: char.avatar,
        cover_img_url: char.coverImg,
        audio_enter_url: char.audio_enter || '',
        region_code: region.id
      }
    }
    return null
  }

  return withMockFallback(event, `/characters/${code}`, buildMock)
})
