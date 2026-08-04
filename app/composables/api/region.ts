import type { Pagination } from '~/types/api'

/** 地区对象 */
export interface Region {
  bg_day_url: string
  bg_night_url: string
  characters: Character[]
  code: string
  create_time: string
  description: string
  id: string
  is_deleted: boolean
  name: string
  sort_order: number
  status: number
  update_time: string
}

/** 角色对象 */
export interface Character {
  audio_enter_url: any
  avatar_url: string
  code: string
  cover_img_url: string
  create_time: string
  cv_cn: any
  cv_jp: any
  description: string
  element: string
  id: string
  is_deleted: boolean
  name: string
  quote: string
  region_code: string
  region_id: string
  region_name: string
  sort_order: number
  status: number
  update_time: string
}

/** 角色列表查询参数 */
export interface CharacterListParams {
  region_code?: string
  page?: number
  pageSize?: number
}

/**
 * 地区角色模块 API 封装
 * 前缀: /regions, /characters
 * 无鉴权要求
 */
export function useRegionApi() {
  const { get } = useApi()

  /**
   * 获取地区列表
   * GET /regions
   */
  async function getRegions(parentId?: number) {
    return await get<Region[]>(
      '/regions',
      parentId !== undefined ? { parent_id: parentId } : undefined
    )
  }

  /**
   * 获取地区详情
   * GET /regions/<region_code>
   */
  async function getRegionDetail(regionCode: string) {
    return await get<Region>(`/regions/${regionCode}`)
  }

  /**
   * 获取角色列表
   * GET /characters
   */
  async function getCharacters(params?: CharacterListParams) {
    return await get<{ characters: Character[]; pagination: Pagination }>('/characters', params)
  }

  /**
   * 获取角色详情
   * GET /characters/<character_code>
   */
  async function getCharacterDetail(characterCode: string) {
    return await get<Character>(`/characters/${characterCode}`)
  }

  return { getRegions, getRegionDetail, getCharacters, getCharacterDetail }
}
