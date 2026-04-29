// ─── Types ───────────────────────────────────────────────────────────────────

export interface Character {
  id: number
  name: string
  element: string
  cv_cn: string // 中文配音
  cv_jp: string // 日文配音
  quote: string
  description: string
  avatar: string // 底部轮播头像 URL
  coverImg: string // 主展示立绘 URL
  audio_enter?: string // 入队语音 URL（可选）
}

export interface Region {
  id: string // URL slug: "mondstadt" | "liyue" | ...
  name: string // 显示名称: "蒙德城"
  bgDay: string // 白天/主背景图
  bgNight?: string // 夜晚/黄昏背景图（可选）
  characters: Character[]
}

export interface CharacterApiResponse {
  code: number
  message: string
  data: any // We will map this manually
}

// ─── Idle Preload ─────────────────────────────────────────────────────────────

/**
 * 利用浏览器空闲时间预加载单张图片
 * 不阻塞主线程，不影响当前 GSAP 动画帧率
 */
const scheduleIdlePreload = (url: string) => {
  if (!url) return
  const task = () => {
    // Check if it's already cached in the global cache
    const target = globalThis as typeof globalThis & {
      __CHARACTER_IMAGE_CACHE_GLOBAL__?: { imageCache: Map<string, HTMLImageElement> }
    }
    const cache = target.__CHARACTER_IMAGE_CACHE_GLOBAL__?.imageCache

    if (cache && cache.has(url)) {
      return
    }

    const img = new Image()
    img.src = url
    if (cache) {
      cache.set(url, img)
    }
  }
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(task, { timeout: 3000 })
  } else {
    setTimeout(task, 1500)
  }
}

/**
 * 后台静默预加载所有地区的全部资源
 * 目前主要是预加载基础图片（如地区背景）
 */
export const preloadAllRegionsIdle = (regions: Region[]) => {
  regions.forEach((region) => {
    scheduleIdlePreload(region.bgDay)
    if (region.bgNight) scheduleIdlePreload(region.bgNight)

    region.characters?.forEach((char) => {
      scheduleIdlePreload(char.coverImg)
      scheduleIdlePreload(char.avatar)
    })
  })
}

// ─── Cache ────────────────────────────────────────────────────────────────────
const cachedRegionsList = ref<Region[]>([])
const cachedRegionDetails = ref<Record<string, Region>>({})

// ─── Composable ───────────────────────────────────────────────────────────────

export const useCharacterData = () => {
  /**
   * 获取所有地区列表（不包含角色数据）
   */
  const fetchRegionsList = async (): Promise<Region[]> => {
    if (cachedRegionsList.value.length > 0) {
      return cachedRegionsList.value
    }
    try {
      const res = await $fetch<CharacterApiResponse>('/api/mock/regions')
      if (res && res.code === 200 && Array.isArray(res.data)) {
        cachedRegionsList.value = res.data.map((apiRegion: any) => ({
          id: apiRegion.code,
          name: apiRegion.name,
          bgDay: apiRegion.bg_day_url || '',
          bgNight: apiRegion.bg_night_url || '',
          characters: apiRegion.characters || []
        }))
        return cachedRegionsList.value
      }
    } catch (error) {
      console.error('Failed to fetch regions list:', error)
    }
    const res = await $fetch<CharacterApiResponse>('/api/mock/regions')
    return res.data.map((r: any) => ({ ...r, characters: [] })) // 只保留地区信息，角色数据留空
  }

  /**
   * 获取单个地区的详细数据（包含角色数据）
   */
  const fetchRegionDetails = async (regionCode: string | undefined): Promise<Region | null> => {
    if (!regionCode) {
      return null
    }
    if (cachedRegionDetails.value[regionCode]) {
      return cachedRegionDetails.value[regionCode]
    }
    try {
      const res = await $fetch<CharacterApiResponse>(`/api/mock/regions/${regionCode}`)
      if (res && res.code === 200 && res.data) {
        const apiRegion = res.data
        const region: Region = {
          id: apiRegion.code,
          name: apiRegion.name,
          bgDay: apiRegion.bg_day_url || '',
          bgNight: apiRegion.bg_night_url || '',
          characters: (apiRegion.characters || []).map((apiChar: any) => ({
            id: apiChar.id,
            name: apiChar.name,
            element: apiChar.element,
            cv_cn: apiChar.cv_cn || '',
            cv_jp: apiChar.cv_jp || '',
            quote: apiChar.quote || '',
            description: apiChar.description || '',
            avatar: apiChar.avatar_url || '',
            coverImg: apiChar.cover_img_url || '',
            audio_enter: apiChar.audio_enter_url || ''
          }))
        }
        cachedRegionDetails.value[regionCode] = region
        return region
      }
    } catch (error) {
      console.error(`Failed to fetch details for region ${regionCode}:`, error)
    }
    return null
  }

  /**
   * 当用户停留在当前地区时，悄悄在后台预加载「下一个地区」第一位角色的立绘和头像
   * 配合 GSAP 动画实现「指哪打哪」的零延迟丝滑感 ✨
   */
  const idlePreloadNextRegion = async (regions: Region[], currentSlug: string) => {
    // 地区Id列表
    const slugs = regions.map((r) => r.id)
    const idx = slugs.indexOf(currentSlug)
    if (idx === -1) return
    const nextIdx = (idx + 1) % slugs.length
    const nextSlug = slugs[nextIdx]

    // 静默拉取下一个地区的数据
    const nextRegion = await fetchRegionDetails(nextSlug)
    if (!nextRegion?.characters?.length) return

    // 连背景图也一并预加载
    scheduleIdlePreload(nextRegion.bgDay)
    // 预加载地区所有角色
    nextRegion.characters.forEach((char) => {
      scheduleIdlePreload(char.coverImg)
      scheduleIdlePreload(char.avatar)
    })
    // 只预加载首角色信息
    // const first = nextRegion.characters[0]
    // if (!first) return
    // scheduleIdlePreload(first.coverImg)
    // scheduleIdlePreload(first.avatar)
  }

  return {
    fetchRegionsList,
    fetchRegionDetails,
    idlePreloadNextRegion,
    preloadAllRegionsIdle
  }
}
