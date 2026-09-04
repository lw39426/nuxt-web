/**
 * 搜索中心 Mock 数据与筛选工具（design/nuxt4_search_page_prompt.md）
 * 所有数据为组件层演示数据，内容贴合技术 / 数码主题，全部中文。
 */
import type {
  ArticleResult,
  CategoryShortcut,
  FilterChip,
  FilterState,
  ProductResult,
  RecentItem,
  RecommendationProduct,
  SearchDirectItem,
  SearchResult,
  SearchSuggestion,
  SortKey,
  TrendingItem
} from '~/types/search'

/** 结果总数上限（配合分页共 10 页） */
export const TOTAL_RESULTS = 128
/** 每页条数：128 / 13 ≈ 10 页 */
export const PAGE_SIZE = 13
export const PRICE_MIN = 0
export const PRICE_MAX = 9999

export const FILTER_DEFAULT: FilterState = {
  types: [],
  priceRange: [PRICE_MIN, PRICE_MAX],
  rating: null,
  tags: []
}

/** 最近搜索（初始种子 4 条） */
export const DEFAULT_RECENT: RecentItem[] = [
  { id: 'r1', keyword: 'Nuxt4 教程' },
  { id: 'r2', keyword: '机械键盘' },
  { id: 'r3', keyword: 'Vue3 组合式 API' },
  { id: 'r4', keyword: '4K 显示器' }
]

/** 热门搜索（6 条，含排名与次数） */
export const TRENDING_SEARCHES: TrendingItem[] = [
  { rank: 1, keyword: 'Nuxt4 全栈开发', count: '12.8万' },
  { rank: 2, keyword: '客制化机械键盘', count: '9.6万' },
  { rank: 3, keyword: 'Vue3 组合式 API', count: '8.2万' },
  { rank: 4, keyword: '4K 显示器推荐', count: '6.4万' },
  { rank: 5, keyword: '主动降噪耳机', count: '5.1万' },
  { rank: 6, keyword: 'TypeScript 入门', count: '4.7万' }
]

/** 分类快捷入口（4 个） */
export const CATEGORY_SHORTCUTS: CategoryShortcut[] = [
  { name: '在线课程', emoji: '📚', count: '128 门课程', keyword: '课程' },
  { name: '数码外设', emoji: '⌨️', count: '342 件好物', keyword: '键盘' },
  { name: '显示设备', emoji: '🖥️', count: '96 件好物', keyword: '显示器' },
  { name: '技术文章', emoji: '📝', count: '521 篇文章', keyword: '指南' }
]

/** 搜索直达（高确定性关键词命中） */
export const SEARCH_DIRECT_ITEMS: SearchDirectItem[] = [
  {
    id: 'direct-nuxt',
    name: 'Nuxt4 全栈开发实战营',
    description: '90 小时体系课 · 含 SSR / Nitro / 部署实战',
    emoji: '🚀',
    price: 899,
    originalPrice: 1299,
    trigger: ['nuxt']
  }
]

/** 右侧推荐商品（2 个） */
export const RECOMMEND_PRODUCTS: RecommendationProduct[] = [
  { id: 'p2', name: '客制化机械键盘 68键', emoji: '⌨️', price: 329, originalPrice: 399 },
  { id: 'p4', name: '主动降噪无线耳机', emoji: '🎧', price: 799, originalPrice: 999 }
]

/** 右侧热门标签（6 个） */
export const HOT_TAGS: string[] = ['Nuxt4', 'Vue3', 'TypeScript', '机械键盘', '显示器', 'AI 编程']

/** 空结果推荐（3 个精简商品） */
export const ZERO_RESULT_RECOMMENDS: RecommendationProduct[] = [
  { id: 'p3', name: '4K IPS 显示器 27英寸', emoji: '🖥️', price: 1599, originalPrice: 1899 },
  { id: 'p2', name: '客制化机械键盘 68键', emoji: '⌨️', price: 329, originalPrice: 399 },
  { id: 'p4', name: '主动降噪无线耳机', emoji: '🎧', price: 799, originalPrice: 999 },
  { id: 'p5', name: '程序员人体工学椅', emoji: '🪑', price: 1299, originalPrice: 1599 }
]

/** 基础商品池（6 条） */
const PRODUCT_POOL: ProductResult[] = [
  {
    id: 'p1',
    type: 'product',
    name: 'Nuxt4 全栈开发实战营（视频课）',
    emoji: '🚀',
    category: '在线课程',
    price: 899,
    originalPrice: 1299,
    rating: 4.9,
    sales: 2356,
    shop: '前端研习社',
    description:
      '覆盖 Nuxt4 目录结构、数据获取、Nitro 服务端与部署上线，配套 12 个实战项目源码与答疑社群。',
    tags: ['Nuxt4', 'Vue3', '全栈'],
    timestamp: Date.parse('2026-08-20')
  },
  {
    id: 'p2',
    type: 'product',
    name: '客制化机械键盘 68键 三模热插拔',
    emoji: '⌨️',
    category: '数码外设',
    price: 329,
    originalPrice: 399,
    rating: 4.8,
    sales: 12543,
    shop: '极客装备店',
    description: 'Gasket 结构 + 全键热插拔，三模连接 4000mAh 长续航，佳达隆轴体顺滑静音。',
    tags: ['机械键盘', '外设', '三模'],
    timestamp: Date.parse('2026-07-12')
  },
  {
    id: 'p3',
    type: 'product',
    name: '4K IPS 显示器 27英寸 Type-C 90W',
    emoji: '🖥️',
    category: '显示设备',
    price: 1599,
    originalPrice: 1899,
    rating: 4.7,
    sales: 8210,
    shop: '屏幕博物馆',
    description: '4K IPS 面板 100% sRGB，Type-C 一线连 90W 反向充电，低蓝光认证适合长时间编码。',
    tags: ['显示器', '4K', 'Type-C'],
    timestamp: Date.parse('2026-08-02')
  },
  {
    id: 'p4',
    type: 'product',
    name: '主动降噪无线耳机 40h 续航',
    emoji: '🎧',
    category: '数码外设',
    price: 799,
    originalPrice: 999,
    rating: 4.6,
    sales: 20311,
    shop: '声学工坊',
    description: '48dB 深度降噪，LDAC 高解析传输，40 小时续航，通勤与专注编码两相宜。',
    tags: ['耳机', '降噪', '无线'],
    timestamp: Date.parse('2026-06-28')
  },
  {
    id: 'p5',
    type: 'product',
    name: '程序员人体工学椅 电竞网布款',
    emoji: '🪑',
    category: '办公家具',
    price: 1299,
    originalPrice: 1599,
    rating: 4.5,
    sales: 5677,
    shop: '坐感研究所',
    description: '腰背分离支撑设计，4D 扶手 + 135° 后仰，网布透气适合久坐办公与游戏。',
    tags: ['人体工学椅', '办公'],
    timestamp: Date.parse('2026-05-15')
  },
  {
    id: 'p6',
    type: 'product',
    name: '便携显示器 15.6英寸 OLED 触控',
    emoji: '📺',
    category: '显示设备',
    price: 1899,
    rating: 4.4,
    sales: 1892,
    shop: '屏幕博物馆',
    description: 'OLED 触控屏 100% DCI-P3，仅 780g 便携出行，Type-C 单线连接笔记本与主机。',
    tags: ['显示器', '便携', 'OLED'],
    timestamp: Date.parse('2026-08-25')
  }
]

/** 基础文章池（6 条） */
const ARTICLE_POOL: ArticleResult[] = [
  {
    id: 'a1',
    type: 'article',
    title: 'Nuxt4 服务端渲染完全指南：从 SSR 到 ISR 增量渲染',
    summary:
      '本文系统梳理 Nuxt4 的渲染管线：useAsyncData 与 useFetch 的取舍、Nitro 路由缓存、routeRules 中的 SWR 配置，以及 ISR 在生产环境的落地经验。',
    author: { name: '林小满', avatar: '林' },
    publishDate: '2026-08-28',
    readCount: 12800,
    likeCount: 452,
    tags: ['Nuxt4', 'SSR', 'Vue3'],
    category: '技术教程 · 前端框架',
    timestamp: Date.parse('2026-08-28')
  },
  {
    id: 'a2',
    type: 'article',
    title: 'Vue3 组合式 API 最佳实践 2026 版：状态管理与逻辑复用',
    summary:
      '从 composable 的设计原则讲到 provide/inject 的边界，附带 10 个可直接落地的组合式函数片段，帮你写出更可预测的 Vue3 代码。',
    author: { name: '陈默', avatar: '陈' },
    publishDate: '2026-07-19',
    readCount: 9600,
    likeCount: 318,
    tags: ['Vue3', 'Composition API'],
    category: '技术教程 · 前端框架',
    timestamp: Date.parse('2026-07-19')
  },
  {
    id: 'a3',
    type: 'article',
    title: '机械键盘选购避坑指南：轴体、键帽与配列全解析',
    summary:
      '线性轴与段落轴的手感差异、PBT 与 ABS 键帽的打油问题、68 键与 87 键配列怎么选，一篇讲清客制化键盘的核心参数。',
    author: { name: '键盘侠老王', avatar: '键' },
    publishDate: '2026-08-05',
    readCount: 15400,
    likeCount: 621,
    tags: ['机械键盘', '外设'],
    category: '数码测评 · 外设装备',
    timestamp: Date.parse('2026-08-05')
  },
  {
    id: 'a4',
    type: 'article',
    title: '4K 显示器怎么选？色彩、接口与护眼参数详解',
    summary:
      'sRGB 与 DCI-P3 色域差多少、Type-C 反向供电功率怎么算、低蓝光认证是不是智商税，读完这篇再下单不踩坑。',
    author: { name: '显示器专家', avatar: '显' },
    publishDate: '2026-08-14',
    readCount: 8900,
    likeCount: 274,
    tags: ['显示器', '4K'],
    category: '数码测评 · 显示设备',
    timestamp: Date.parse('2026-08-14')
  },
  {
    id: 'a5',
    type: 'article',
    title: 'TypeScript 类型体操入门：从 Utility Types 到条件类型',
    summary:
      '以 Partial、Pick、Exclude 为起点，逐步推演出条件类型与 infer 的推导规则，附 8 道由易到难的类型体操练习题。',
    author: { name: '类型小玩家', avatar: '类' },
    publishDate: '2026-06-30',
    readCount: 7300,
    likeCount: 199,
    tags: ['TypeScript'],
    category: '技术教程 · 编程语言',
    timestamp: Date.parse('2026-06-30')
  },
  {
    id: 'a6',
    type: 'article',
    title: '2026 程序员桌面搭建指南：效率与美学兼得',
    summary:
      '显示器支架、键位布局、线材收纳与灯光氛围的平衡之道，用 3000 元预算搭出舒服的编码工位。',
    author: { name: '桌面规划师', avatar: '桌' },
    publishDate: '2026-09-01',
    readCount: 6200,
    likeCount: 187,
    tags: ['桌面搭建', '效率'],
    category: '生活方式 · 效率工具',
    timestamp: Date.parse('2026-09-01')
  }
]

/** 基础池：产品在前、文章在后（综合排序的默认顺序） */
export const SEARCH_POOL: SearchResult[] = [...PRODUCT_POOL, ...ARTICLE_POOL]

/** 将基础池确定性扩展为 TOTAL_RESULTS 条，保证分页/筛选演示数据量 */
let expandedCache: SearchResult[] | null = null
export function getExpandedPool(): SearchResult[] {
  if (expandedCache) return expandedCache
  const list: SearchResult[] = []
  for (let i = 0; i < TOTAL_RESULTS; i++) {
    const base = SEARCH_POOL[i % SEARCH_POOL.length]!
    if (base.type === 'product') {
      list.push({
        ...base,
        id: `${base.id}#${i}`,
        // 确定性微调价格 / 销量 / 发布时间，让筛选与排序有区分度
        price: base.price + (i % 5) * 20,
        sales: base.sales + (i % 7) * 137,
        timestamp: base.timestamp - i * 43_200_000
      })
    } else {
      list.push({
        ...base,
        id: `${base.id}#${i}`,
        readCount: base.readCount + (i % 6) * 823,
        likeCount: base.likeCount + (i % 5) * 41,
        timestamp: base.timestamp - i * 43_200_000
      })
    }
  }
  expandedCache = list
  return list
}

/** 按关键词联想，产品最多 2 条、文章最多 3 条 */
export function getSuggestions(query: string): SearchSuggestion[] {
  const kw = query.trim().toLowerCase()
  if (!kw) return []
  const products: SearchSuggestion[] = []
  const articles: SearchSuggestion[] = []
  for (const item of SEARCH_POOL) {
    const title = item.type === 'product' ? item.name : item.title
    const haystack = `${title} ${item.category} ${item.tags.join(' ')}`.toLowerCase()
    if (!haystack.includes(kw)) continue
    const suggestion: SearchSuggestion = {
      id: item.id,
      type: item.type,
      title,
      category: item.category
    }
    if (item.type === 'product' && products.length < 2) products.push(suggestion)
    if (item.type === 'article' && articles.length < 3) articles.push(suggestion)
  }
  return [...products, ...articles]
}

/** 搜索直达：命中 trigger 关键词时返回直达卡片 */
export function getSearchDirect(query: string): SearchDirectItem | null {
  const kw = query.trim().toLowerCase()
  if (!kw) return null
  return SEARCH_DIRECT_ITEMS.find((item) => item.trigger.some((t) => kw.includes(t))) ?? null
}

/** 关键词 + 筛选条件过滤，并按排序键排序 */
export function filterAndSortResults(
  items: SearchResult[],
  keyword: string,
  filters: FilterState,
  sort: SortKey
): SearchResult[] {
  const kw = keyword.trim().toLowerCase()
  const [minPrice, maxPrice] = filters.priceRange
  const priceChanged = minPrice > PRICE_MIN || maxPrice < PRICE_MAX

  const filtered = items.filter((item) => {
    if (kw) {
      const parts =
        item.type === 'product'
          ? [item.name, item.description, item.category, item.shop, ...item.tags]
          : [item.title, item.summary, item.category, item.author.name, ...item.tags]
      if (!parts.join(' ').toLowerCase().includes(kw)) return false
    }
    // 内容类型
    if (filters.types.length > 0 && !filters.types.includes(item.type)) return false
    // 价格区间 / 评分仅约束有评分与价格的商品，文章不受影响
    if (item.type === 'product') {
      if (priceChanged && (item.price < minPrice || item.price > maxPrice)) return false
      if (filters.rating !== null && item.rating < filters.rating) return false
    }
    // 标签
    if (filters.tags.length > 0 && !item.tags.some((t) => filters.tags.includes(t))) return false
    return true
  })

  switch (sort) {
    case 'latest':
      return [...filtered].sort((a, b) => b.timestamp - a.timestamp)
    case 'hottest':
      return [...filtered].sort((a, b) =>
        a.type === 'product' && b.type === 'product'
          ? b.sales - a.sales
          : a.type === 'article' && b.type === 'article'
            ? b.readCount - a.readCount
            : a.type === 'product'
              ? -1
              : 1
      )
    case 'price-asc':
      // 商品按价格升序靠前，文章保持原有相对顺序排在后面
      return [...filtered].sort(
        (a, b) =>
          (a.type === 'product' ? a.price : Infinity) - (b.type === 'product' ? b.price : Infinity)
      )
    default:
      return filtered
  }
}

/** 由筛选状态推导结果头部的已选筛选胶囊 */
export function buildFilterChips(filters: FilterState): FilterChip[] {
  const chips: FilterChip[] = []
  if (filters.types.length === 1) {
    chips.push({ key: 'type', label: filters.types[0] === 'product' ? '产品' : '文章' })
  }
  const [min, max] = filters.priceRange
  if (min > PRICE_MIN || max < PRICE_MAX) {
    chips.push({ key: 'price', label: `¥${min} - ¥${max}` })
  }
  if (filters.rating !== null) {
    chips.push({ key: 'rating', label: `${filters.rating}分以上` })
  }
  for (const tag of filters.tags) {
    chips.push({ key: `tag:${tag}`, label: tag })
  }
  return chips
}

/** 大数缩写：≥1万 → x.x万（热门搜索、月销量） */
export function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`
  return String(n)
}

/** 大数缩写：≥1000 → x.xk（阅读量） */
export function formatCompact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
