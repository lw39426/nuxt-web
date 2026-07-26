import type { Pagination } from '~/types/api'

/** 地区对象 */
export interface Region {
  id: number
  code: string
  name: string
  description?: string
  image?: string
  parent_id?: number
  children: Region[]
}

/** 角色对象 */
export interface Character {
  id: number
  code: string
  name: string
  description?: string
  image?: string
  region_code?: string
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
