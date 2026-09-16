/** 图鉴角色条目 */
export interface CollectionCharacter {
  id: number
  code: string
  name: string
  brand: string
  character_type: string
  era: string
  rating: number
  collected: boolean
}

/** 图鉴数据 */
export interface CollectionData {
  total: number
  collected_count: number
  characters: CollectionCharacter[]
}

/** 收集切换结果 */
export interface CollectionToggleResult {
  character_id: number
  collected: boolean
}

/**
 * 图鉴模块 API 封装
 * 前缀: /collection
 * 需要鉴权
 */
export function useCollectionApi() {
  const { get, post } = useApi()

  /**
   * 获取图鉴数据（全量角色 + 收集状态 + 进度）
   * GET /collection（文件 index.get.ts，Nitro 注册时省略 index 段）
   */
  async function getCollection() {
    return await get<CollectionData>('/collection')
  }

  /**
   * 收集 / 取消收集（切换）
   * POST /collection/toggle
   */
  async function toggle(characterId: number) {
    return await post<CollectionToggleResult>('/collection/toggle', {
      character_id: characterId
    })
  }

  return { getCollection, toggle }
}
