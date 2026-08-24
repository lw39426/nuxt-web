import { MOCK_CHARACTER_REGIONS } from '../../../utils/mockCharacterRegions'

/**
 * 获取角色列表接口
 * GET /api/v1/characters
 * 查询参数: region_code, page, pageSize
 * 优先代理 Flask，失败时降级为 Mock 数据
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  const regionCode = query.region_code ? String(query.region_code) : ''

  /** 构造角色列表 Mock 数据：按地区筛选并展开后做内存分页 */
  const buildMock = () => {
    const regions = regionCode
      ? MOCK_CHARACTER_REGIONS.filter((region) => region.id === regionCode)
      : MOCK_CHARACTER_REGIONS

    const characters = regions.flatMap((region) =>
      region.characters.map((char) => ({
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
      }))
    )

    const total = characters.length
    const start = (page - 1) * pageSize

    return {
      characters: characters.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  return withMockFallback(event, '/characters', buildMock)
})
