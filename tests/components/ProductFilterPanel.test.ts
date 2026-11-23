// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import {
  defineComponent,
  h,
  onBeforeMount,
  reactive,
  shallowRef,
  Suspense,
  type Component
} from 'vue'
import ProductFilterPanel from '~/components/product/ProductFilterPanel.vue'
import { useProductCatalog } from '~/composables/useProductCatalog'
import type { Product, ProductBrand, ProductSeriesGroup } from '~/types/product'
import { buildProductFilterGroups, createEmptyProductFilters } from '~/utils/productFilters'

const api = vi.hoisted(() => ({
  getEnabledBrands: vi.fn(),
  getProductCatalog: vi.fn(),
  getProducts: vi.fn()
}))

vi.mock('~/composables/api/brand', () => ({ useBrandApi: () => api }))
vi.mock('~/composables/api/category', () => ({ useCategoryApi: () => api }))

const brands: ProductBrand[] = [
  { code: 'brand-a', name: '甲品牌', logo: '' },
  { code: 'brand-b', name: '乙品牌', logo: '' }
]

/** 创建同时具有品牌与角色属性的商品，供组合筛选断言使用。 */
function product(
  code: string,
  brand: ProductBrand | null,
  overrides: Partial<Product> = {}
): Product {
  return {
    code,
    name: code,
    description: '',
    price: 0,
    salePrice: 0,
    stock: 0,
    category_id: 1,
    status: 1,
    main_image: '',
    images: [],
    detail_html: '',
    sales: 0,
    sort: 0,
    brand,
    category_name: '作品一',
    tags: [{ id: 1, name: '热血', color: '', weight: 1 }],
    era: '90年代',
    character_type: '主角',
    create_time: '',
    update_time: '',
    ...overrides
  }
}

const catalogSeries: ProductSeriesGroup[] = [
  {
    categoryId: 1,
    category: '作品一',
    categoryImage: '',
    products: [
      product('a', brands[0]!),
      product('b', brands[1]!),
      product('c', brands[1]!, { character_type: '反派' }),
      product('d', null)
    ],
    total: 4
  },
  {
    categoryId: 2,
    category: '作品二',
    categoryImage: '',
    products: [product('e', brands[1]!, { category_id: 2, era: '20年代' })],
    total: 1
  }
]
const categories = catalogSeries.map((item) => ({
  id: item.categoryId,
  name: item.category,
  image: ''
}))
let route = reactive({ query: {} as Record<string, unknown> })
const replace = vi.fn()
/** 临时记录真实 composable 是否进入客户端 toast 分支。 */
const useToastProbe = vi.fn(() => ({ add: vi.fn() }))
const wrappers: VueWrapper[] = []
const hosts: HTMLElement[] = []
let catalog: Awaited<ReturnType<typeof useProductCatalog>>

/** 模拟 Nuxt 的可解构 Promise、响应式状态、lazy 挂载请求与显式 refresh。 */
function useAsyncDataStub<T>(
  _key: string,
  handler: () => Promise<T>,
  options: { default: () => T; lazy?: boolean }
) {
  const data = shallowRef(options.default())
  const error = shallowRef<unknown>(null)
  const status = shallowRef<'idle' | 'pending' | 'success' | 'error'>('idle')
  const refresh = vi.fn(async () => {
    status.value = 'pending'
    error.value = null
    try {
      data.value = await handler()
      status.value = 'success'
    } catch (cause) {
      data.value = options.default()
      error.value = cause
      status.value = 'error'
    }
  })
  const state = { data, error, status, refresh }
  if (options.lazy) {
    onBeforeMount(() => void refresh())
    return Object.assign(Promise.resolve(state), state)
  }
  return Object.assign(
    refresh().then(() => state),
    state
  )
}

const CatalogHarness = defineComponent({
  /** 连接真实目录 composable 与筛选组件，仅隔离接口和 Nuxt 运行时。 */
  async setup() {
    catalog = await useProductCatalog()
    return () =>
      h(ProductFilterPanel, {
        categories: catalog.categories.value,
        selectedCategoryId: catalog.selectedCategoryId.value,
        filterGroups: catalog.filterGroups.value,
        selectedFilters: catalog.selectedFilters.value,
        activeTags: catalog.activeFilterTags.value,
        activeFilterCount: catalog.activeFilterCount.value,
        resultCount: catalog.filteredCharacterCount.value,
        brandsLoading: catalog.brandsLoading.value,
        brandsError: catalog.brandsError.value,
        onSelectCategory: catalog.selectCategory,
        onToggleFilter: catalog.toggleFilter,
        onClearFilters: catalog.clearFilters,
        onRetryBrands: catalog.retryBrands
      })
  }
})
const SuspenseHarness = defineComponent({
  /** 保留异步页面 setup 的 Suspense 与挂载生命周期。 */
  setup() {
    return () => h(Suspense, null, { default: () => h(CatalogHarness) })
  }
})

/** 挂载到独立 DOM 容器，确保键盘焦点断言和卸载隔离。 */
function mountComponent(component: Component, props: Record<string, unknown> = {}) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  hosts.push(host)
  const wrapper = mount(component, {
    props,
    attachTo: host,
    global: { stubs: { ProductCategoryPager: true } }
  })
  wrappers.push(wrapper)
  return wrapper
}

/** 单独挂载筛选面板，使用实际候选项契约。 */
function mountPanel(overrides: Record<string, unknown> = {}) {
  return mountComponent(ProductFilterPanel, {
    categories,
    selectedCategoryId: null,
    filterGroups: buildProductFilterGroups(
      catalogSeries.flatMap((item) => item.products),
      brands
    ),
    selectedFilters: createEmptyProductFilters(),
    activeTags: [],
    activeFilterCount: 0,
    resultCount: 5,
    brandsLoading: false,
    brandsError: '',
    ...overrides
  })
}

/** 从 URL 初始状态挂载目录及筛选面板。 */
async function mountCatalog(query: Record<string, unknown> = {}) {
  route.query = query
  const wrapper = mountComponent(SuspenseHarness)
  await flushPromises()
  return wrapper
}

/** 展开筛选并切换品牌标签，不依赖品牌展示名称定位 tab。 */
async function openBrands(wrapper: VueWrapper) {
  await wrapper.get('button[aria-expanded]').trigger('click')
  await wrapper.get('[role="tab"][id$="-tab-brand"]').trigger('click')
}

/** 获取品牌选项面板，避免误选已选标签上的移除按钮。 */
function brandPanel(wrapper: VueWrapper) {
  return wrapper.get('[role="tabpanel"][id$="-group-brand"]')
}

beforeEach(() => {
  api.getEnabledBrands.mockReset().mockResolvedValue(brands)
  api.getProductCatalog.mockReset().mockResolvedValue({ categories, series: catalogSeries })
  api.getProducts.mockReset().mockImplementation(async (id: number) => {
    const item = catalogSeries.find((series) => series.categoryId === id)!
    return {
      category_name: item.category,
      products: item.products,
      pagination: { page: 1, pageSize: 100, total: item.total, pages: 1 }
    }
  })
  // 每个用例使用独立 route，避免前序 composable 实例的残留 watcher 互相触发
  route = reactive({ query: {} as Record<string, unknown> })
  replace.mockReset().mockImplementation(({ query }: { query: Record<string, unknown> }) => {
    route.query = query
    return Promise.resolve()
  })
  useToastProbe.mockClear()
  vi.stubGlobal('useRoute', () => route)
  vi.stubGlobal('useRouter', () => ({ replace }))
  vi.stubGlobal('useToast', useToastProbe)
  vi.stubGlobal('useAsyncData', useAsyncDataStub)
})

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  hosts.splice(0).forEach((host) => host.remove())
  vi.unstubAllGlobals()
})

describe('ProductFilterPanel 品牌筛选', () => {
  it('展示品牌名称，选择事件使用品牌 code', async () => {
    const wrapper = mountPanel()
    await openBrands(wrapper)
    const options = brandPanel(wrapper).findAll('button[aria-pressed]')
    expect(options.map((button) => button.text())).toEqual(['甲品牌', '乙品牌'])
    await options[0]!.trigger('click')
    expect(wrapper.emitted('toggle-filter')).toEqual([['brand', 'brand-a']])
  })

  it('空候选项仍保留品牌标签，区分加载、成功空列表、失败和重试', async () => {
    const wrapper = mountPanel({
      filterGroups: buildProductFilterGroups([], []),
      brandsLoading: true
    })
    await openBrands(wrapper)
    expect(brandPanel(wrapper).attributes('aria-busy')).toBe('true')
    expect(brandPanel(wrapper).get('[role="status"]').text()).toBe('正在加载品牌…')
    await wrapper.setProps({ brandsLoading: false })
    expect(brandPanel(wrapper).text()).toBe('暂无启用品牌')
    await wrapper.setProps({ brandsError: '品牌加载失败，请重试' })
    expect(brandPanel(wrapper).get('[role="alert"]').text()).toContain('品牌加载失败')
    await brandPanel(wrapper).get('button').trigger('click')
    expect(wrapper.emitted('retry-brands')).toEqual([[]])
    expect(wrapper.emitted('toggle-filter')).toBeUndefined()
    await wrapper.setProps({ brandsLoading: true })
    expect(brandPanel(wrapper).find('[role="alert"]').exists()).toBe(false)
  })

  it('四个筛选标签支持 End/Home 键切换及焦点同步', async () => {
    const wrapper = mountPanel()
    await wrapper.get('button[aria-expanded]').trigger('click')
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(4)
    await wrapper.get('[role="tablist"]').trigger('keydown', { key: 'End' })
    const brandTab = wrapper.get('[role="tab"][id$="-tab-brand"]')
    expect(brandTab.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(brandTab.element)
    await brandTab.trigger('keydown', { key: 'Home' })
    const typeTab = wrapper.get('[role="tab"][id$="-tab-character_type"]')
    expect(typeTab.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(typeTab.element)
  })
})

describe('目录与品牌筛选联动', () => {
  it('进入 composable 的客户端分支并初始化 toast', async () => {
    await mountCatalog()
    expect(useToastProbe).toHaveBeenCalledTimes(1)
  })

  it('lazy 品牌请求不阻塞目录结果，完成后补入真实品牌名称', async () => {
    let resolveBrands!: (value: ProductBrand[]) => void
    api.getEnabledBrands.mockReturnValueOnce(
      new Promise<ProductBrand[]>((resolve) => {
        resolveBrands = resolve
      })
    )
    const wrapper = await mountCatalog()
    expect(catalog.filteredCharacterCount.value).toBe(5)
    await openBrands(wrapper)
    expect(brandPanel(wrapper).text()).toBe('正在加载品牌…')
    resolveBrands(brands)
    await flushPromises()
    expect(brandPanel(wrapper).findAll('button[aria-pressed]')).toHaveLength(2)
    expect(brandPanel(wrapper).text()).toContain('甲品牌')
  })

  it('多品牌 OR、跨维度 AND、名称标签移除及重置同步到 URL', async () => {
    const wrapper = await mountCatalog({ campaign: 'keep' })
    await openBrands(wrapper)
    for (const button of brandPanel(wrapper).findAll('button[aria-pressed]')) {
      await button.trigger('click')
      await flushPromises()
    }
    expect(catalog.filteredCharacterCount.value).toBe(4)
    expect(catalog.activeFilterCount.value).toBe(2)
    expect(replace).toHaveBeenCalled()
    expect(route.query).toEqual({ campaign: 'keep', brand: 'brand-a,brand-b' })
    expect(brandPanel(wrapper).findAll('[aria-pressed="true"]')).toHaveLength(2)
    await wrapper.get('[role="tab"][id$="-tab-character_type"]').trigger('click')
    await wrapper.get('[role="tabpanel"][id$="-group-character_type"] button').trigger('click')
    await flushPromises()
    expect(catalog.filteredCharacterCount.value).toBe(3)
    expect(catalog.activeFilterCount.value).toBe(3)
    expect(route.query.type).toBe('主角')
    await wrapper.get('button[aria-label="移除品牌筛选 甲品牌"]').trigger('click')
    await flushPromises()
    expect(catalog.selectedFilters.value.brand).toEqual(['brand-b'])
    expect(catalog.filteredCharacterCount.value).toBe(2)
    expect(route.query.brand).toBe('brand-b')
    const reset = wrapper.findAll('button').find((button) => button.text() === '重置')!
    await reset.trigger('click')
    await flushPromises()
    expect(catalog.activeFilterCount.value).toBe(0)
    expect(catalog.filteredCharacterCount.value).toBe(5)
    expect(route.query).toEqual({ campaign: 'keep' })
  })

  it('从 URL 恢复分类与四维筛选，重置保留分类及分类缓存', async () => {
    await mountCatalog({
      category: '1',
      brand: ['brand-a', 'brand-b'],
      type: '主角',
      era: '90年代',
      tag: '热血',
      campaign: 'keep'
    })
    expect(catalog.selectedFilters.value.brand).toEqual(['brand-a', 'brand-b'])
    expect(catalog.activeFilterCount.value).toBe(5)
    expect(catalog.filteredCharacterCount.value).toBe(2)
    expect(catalog.activeFilterTags.value.filter((tag) => tag.key === 'brand')).toEqual([
      { key: 'brand', label: '品牌', value: 'brand-a', displayValue: '甲品牌' },
      { key: 'brand', label: '品牌', value: 'brand-b', displayValue: '乙品牌' }
    ])
    catalog.clearFilters()
    await flushPromises()
    expect(catalog.selectedCategoryId.value).toBe(1)
    expect(catalog.filteredCharacterCount.value).toBe(4)
    expect(route.query).toEqual({ category: '1', campaign: 'keep' })
    catalog.selectCategory(1)
    await flushPromises()
    expect(api.getProducts).toHaveBeenCalledTimes(1)
  })

  it('路由查询变化恢复品牌选择，显示全部分类不会清除品牌', async () => {
    await mountCatalog({ brand: 'brand-a' })
    expect(catalog.filteredCharacterCount.value).toBe(1)
    route.query = { category: '2', brand: 'brand-b', campaign: 'keep' }
    await flushPromises()
    expect(catalog.selectedFilters.value.brand).toEqual(['brand-b'])
    expect(catalog.selectedCategoryId.value).toBe(2)
    expect(catalog.filteredCharacterCount.value).toBe(1)
    catalog.showAllCategories()
    await flushPromises()
    expect(catalog.filteredCharacterCount.value).toBe(3)
    expect(route.query).toEqual({ brand: 'brand-b', campaign: 'keep' })
    route.query = { brand: 'brand-a' }
    await flushPromises()
    expect(catalog.filteredCharacterCount.value).toBe(1)
    expect(catalog.selectedFilters.value.brand).toEqual(['brand-a'])
  })

  it('失败不补造品牌选项，重试重新调用接口且保留已有筛选', async () => {
    api.getEnabledBrands.mockRejectedValueOnce(new Error('后端不可用'))
    const wrapper = await mountCatalog({ brand: 'brand-a', type: '主角' })
    await openBrands(wrapper)
    expect(brandPanel(wrapper).get('[role="alert"]').text()).toContain('品牌加载失败')
    expect(brandPanel(wrapper).findAll('button[aria-pressed]')).toHaveLength(0)
    expect(catalog.filteredCharacterCount.value).toBe(1)
    expect(api.getEnabledBrands).toHaveBeenCalledTimes(1)
    await brandPanel(wrapper).get('button').trigger('click')
    await flushPromises()
    expect(api.getEnabledBrands).toHaveBeenCalledTimes(2)
    expect(catalog.selectedFilters.value.brand).toEqual(['brand-a'])
    expect(catalog.activeFilterCount.value).toBe(2)
    expect(route.query).toEqual({ brand: 'brand-a', type: '主角' })
    expect(wrapper.get('button[aria-label="移除品牌筛选 甲品牌"]').exists()).toBe(true)
    expect(brandPanel(wrapper).find('[role="alert"]').exists()).toBe(false)
  })
})
