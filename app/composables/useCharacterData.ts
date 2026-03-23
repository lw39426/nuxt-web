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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_REGIONS: Region[] = [
  {
    id: 'mondstadt',
    name: '蒙德城',
    bgDay: 'https://uploadstatic.mihoyo.com/contentweb/20200211/2020021114220951905.jpg',
    bgNight: 'https://uploadstatic.mihoyo.com/contentweb/20210218/2021021815221477648.jpg',
    characters: [
      {
        id: 118853,
        name: '琴',
        element: 'Anemo',
        cv_cn: '林簌',
        cv_jp: '斎藤千和',
        quote: '风啊，回应我吧！',
        description:
          '身为西风骑士团的代理团长，一直忠于职守，为人们带来安宁。虽然并非天赋异禀，但通过刻苦训练，如今的她已是能够独当一面的骑士了。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718344593599.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/06/30/b51565c6f1298e534e90b6e63332e9c1_6618231443033589469.png',
        audio_enter: ''
      },
      {
        id: 118854,
        name: '安柏',
        element: 'Pyro',
        cv_cn: '牛奶君',
        cv_jp: '木野日菜',
        quote: '侦察骑士安柏，前来报到！',
        description:
          '西风骑士团侦察骑士，活泼开朗的少女。是蒙德城有史以来最出色的飞行冠军，也是蒙德城骑士团中唯一的侦察骑士。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718350213870.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/6f0ef40157e95b0d59455c12f4d3f270_3262958961633311108.png',
        audio_enter: ''
      }
    ]
  },
  {
    id: 'liyue',
    name: '璃月港',
    bgDay: 'https://uploadstatic.mihoyo.com/contentweb/20200515/2020051511072867344.jpg',
    bgNight: 'https://uploadstatic.mihoyo.com/contentweb/20210218/2021021815224612647.jpg',
    characters: [
      {
        id: 118858,
        name: '魈',
        element: 'Anemo',
        cv_cn: 'kinsen',
        cv_jp: '内田雄馬',
        quote: '如遇失道旷野之难，路遭贼人之难……',
        description:
          '守护璃月港的"三眼五显仙人"之一，妙称"护法夜叉大将"。受业于降魔大神明蕊，诛除魔物无数，背负着难以言说的业障。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20200306/2020030617035787693.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/06/30/930f3ce55517e3c711a962c82e4639c0_8788966481995409698.png',
        audio_enter: ''
      },
      {
        id: 118859,
        name: '凝光',
        element: 'Geo',
        cv_cn: '杜冥鸦',
        cv_jp: '沢城みゆき',
        quote: '都在我的算计之中。',
        description:
          '坐拥空中宫殿，有着大量传言的璃月权贵，脸上总是挂着优雅神秘的笑容。她正在悄悄实施着一个宏大的商业计划。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20200306/2020030617042023125.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/d35a0a1d13f821fd55a6951210c672ac_8868204139408761896.png',
        audio_enter: ''
      },
      {
        id: 118860,
        name: '胡桃',
        element: 'Pyro',
        cv_cn: '忻幸',
        cv_jp: '東山奈央',
        quote: '人生有涯，别嫌我说话太直。',
        description:
          '往生堂第七十七代堂主，「华祭」策划者，有着令人难以捉摸的个性，又或许在她怪异的举止背后，藏着比任何人都更豁达的生死观。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718373148742.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/70f748a4a81ff5fd31ccecb35a81a1b8_752703024219609484.png',
        audio_enter: ''
      },
      {
        id: 118861,
        name: '钟离',
        element: 'Geo',
        cv_cn: '鱼冻',
        cv_jp: '前野智昭',
        quote: '所谓历史，是无论如何也忘不掉的东西。',
        description:
          '以"顾问"身份受雇于往生堂的神秘男人。博古通今，消息灵通，是整个璃月知识最为渊博的人之一。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718374943706.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/f2df5ea8a614f6e4b33f34f0b5eec3b6_8344751501398994891.png',
        audio_enter: ''
      },
      {
        id: 118862,
        name: '甘雨',
        element: 'Cryo',
        cv_cn: '卢静',
        cv_jp: '本渡楓',
        quote: '若使命允许，我愿永伴左右。',
        description:
          '半人半仙鹤的璃月七星之一"天权"的秘书，平静内敛，言语简洁。为了更好地完成工作，她不断自我鞭策，不知疲倦。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718381024600.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/b6c1a7e1b3a16a73c0b67e4b7e5fec6e_1001826176553762882.png',
        audio_enter: ''
      }
    ]
  },
  {
    id: 'inazuma',
    name: '稻妻城',
    bgDay: '	https://uploadstatic.mihoyo.com/contentweb/20210719/2021071917030766463.jpg',
    bgNight: 'https://uploadstatic.mihoyo.com/contentweb/20210719/2021071917033032133.jpg',
    characters: [
      {
        id: 118893,
        name: '神里绫华',
        element: 'Anemo',
        cv_cn: '林簌',
        cv_jp: '斎藤千和',
        quote: '对于您会面一事，我期待很久！',
        description:
          '稻妻「社奉行」神里家的大小姐。端庄文雅，聪慧坚韧。待人接物真诚又得体，深受稻妻民众爱戴，贵有「白鹭公主」之名。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20210720/2021072011085576262.png',
        coverImg: 'https://uploadstatic.mihoyo.com/contentweb/20210720/2021072011090118454.png',
        audio_enter: ''
      },
      {
        id: 118854,
        name: '雷电将军',
        element: 'Pyro',
        cv_cn: '牛奶君',
        cv_jp: '木野日菜',
        quote: '唯有永恒，才最接近真理！',
        description: '雷电将军——此世最殊胜威怖的雷霆化身，稻妻幕府的最高主宰。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20210817/2021081714114216212.png',
        coverImg:
          '	https://webstatic.mihoyo.com/upload/contentweb/202…f8859b7077d92ae38d925e15e_7767077963502328666.png',
        audio_enter: ''
      }
    ]
  }
]

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
      const res = await $fetch<CharacterApiResponse>('http://193.112.118.107:5050/miniapp/regions')
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
    // 兜底返回 Mock 数据的地区列表（不含角色）
    return MOCK_REGIONS.map((r) => ({ ...r, characters: [] }))
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
      const res = await $fetch<CharacterApiResponse>(
        `http://193.112.118.107:5050/miniapp/regions/${regionCode}`
      )
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
    // 兜底返回 Mock 数据中对应的地区详情
    const mockRegion = MOCK_REGIONS.find((r) => r.id === regionCode)
    if (mockRegion) {
      cachedRegionDetails.value[regionCode] = mockRegion
      return mockRegion
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
