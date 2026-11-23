import { computed, onMounted, reactive, ref, watch } from 'vue'
import type {
  ProductBrand,
  ProductCatalogFilters,
  ProductCategory,
  ProductFilterKey,
  ProductSeriesGroup
} from '~/types/product'
import { useBrandApi } from '~/composables/api/brand'
import { useCategoryApi } from '~/composables/api/category'
import {
  applyProductFilters,
  buildActiveFilterTags,
  buildProductFilterGroups,
  countActiveFilters,
  countSeriesProducts,
  createEmptyProductFilters
} from '~/utils/productFilters'

const CATEGORY_PAGE_SIZE = 100

type QueryRecord = Record<string, unknown>

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function parseCategoryId(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw == null || raw === '') return null
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : null
}

/** 从 URL 恢复各维度筛选，品牌值为 code 而非名称。 */
function parseFilters(query: QueryRecord): ProductCatalogFilters {
  return {
    character_type: toArray(query.type),
    era: toArray(query.era),
    tag: toArray(query.tag),
    brand: toArray(query.brand)
  }
}

function sameArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((item) => set.has(item))
}

/** 比较筛选状态，避免 URL 与品牌多选状态之间重复同步。 */
function sameFilters(a: ProductCatalogFilters, b: ProductCatalogFilters): boolean {
  return (
    sameArray(a.character_type, b.character_type) &&
    sameArray(a.era, b.era) &&
    sameArray(a.tag, b.tag) &&
    sameArray(a.brand, b.brand)
  )
}

function sameQuery(a: Record<string, string>, b: Record<string, string>): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => a[key] === b[key])
}

/** 组合商品目录、真实品牌选项与 URL 驱动的前端筛选状态。 */
export async function useProductCatalog() {
  const route = useRoute()
  const router = useRouter()
  // 客户端标记；happy-dom 等测试环境未注入 import.meta.client 时回退到 window 判断
  const isClient = import.meta.client || typeof window !== 'undefined'
  const toast = isClient ? useToast() : null
  const { getProductCatalog, getProducts } = useCategoryApi()
  const { getEnabledBrands } = useBrandApi()

  const selectedCategoryId = ref<number | null>(parseCategoryId(route.query.category))
  const selectedFilters = ref<ProductCatalogFilters>(parseFilters(route.query as QueryRecord))
  const categoryCache = reactive(new Map<number, ProductSeriesGroup>())
  const categoryLoading = ref(false)
  let categoryRequestId = 0

  onMounted(() => {
    const id = selectedCategoryId.value
    if (id != null) void loadCategory(id)
  })

  const {
    data: brandData,
    error: brandError,
    status: brandStatus,
    refresh: refreshBrands
  } = useAsyncData('product-brands', () => getEnabledBrands(), {
    default: () => [] as ProductBrand[],
    lazy: true
  })

  const { data: catalogData, error: catalogError } = await useAsyncData(
    'product-catalog',
    () => getProductCatalog(),
    {
      default: () => ({ categories: [] as ProductCategory[], series: [] as ProductSeriesGroup[] })
    }
  )

  const brands = computed<ProductBrand[]>(() => brandData.value || [])
  const brandsLoading = computed(() => brandStatus.value === 'pending')
  const brandsError = computed(() => (brandError.value ? '品牌加载失败，请重试' : ''))
  const categories = computed<ProductCategory[]>(() => catalogData.value?.categories || [])
  const allSeries = computed<ProductSeriesGroup[]>(() => catalogData.value?.series || [])
  const allProducts = computed(() => allSeries.value.flatMap((series) => series.products))

  if (
    selectedCategoryId.value != null &&
    !categories.value.some((category) => category.id === selectedCategoryId.value)
  ) {
    selectedCategoryId.value = null
  }

  const activeSeries = computed<ProductSeriesGroup[]>(() => {
    const id = selectedCategoryId.value
    if (id == null) return allSeries.value
    const cached = categoryCache.get(id)
    if (cached) return [cached]
    return allSeries.value.filter((series) => series.categoryId === id)
  })

  const filterGroups = computed(() => buildProductFilterGroups(allProducts.value, brands.value))
  const series = computed(() => applyProductFilters(activeSeries.value, selectedFilters.value))
  const activeFilterTags = computed(() =>
    buildActiveFilterTags(selectedFilters.value, brands.value)
  )
  const activeFilterCount = computed(() => countActiveFilters(selectedFilters.value))
  const filteredCharacterCount = computed(() => countSeriesProducts(series.value))
  const totalCharacters = computed(() =>
    allSeries.value.reduce((sum, item) => sum + (item.total || item.products.length), 0)
  )
  const hasActiveFilters = computed(() => activeFilterCount.value > 0)
  const hasCategoryFilter = computed(() => selectedCategoryId.value != null)

  /** 重新加载全部品牌，不清除当前品牌选择或其他筛选。 */
  function retryBrands() {
    if (brandStatus.value !== 'pending') void refreshBrands()
  }

  async function fetchCategorySeries(id: number): Promise<ProductSeriesGroup> {
    const first = await getProducts(id, { page: 1, pageSize: CATEGORY_PAGE_SIZE })
    const pagination = first.pagination
    const pageSize = Number(pagination?.pageSize) || CATEGORY_PAGE_SIZE
    const total = Number(pagination?.total) || 0
    const pages = Math.max(
      1,
      Number(pagination?.pages) || (total > 0 ? Math.ceil(total / pageSize) : 1)
    )
    const rest =
      pages > 1
        ? await Promise.all(
            Array.from({ length: pages - 1 }, (_, index) =>
              getProducts(id, { page: index + 2, pageSize: CATEGORY_PAGE_SIZE })
            )
          )
        : []

    const seen = new Set<string>()
    const products = [first, ...rest]
      .flatMap((response) => (Array.isArray(response.products) ? response.products : []))
      .filter((product) => {
        if (!product.code || seen.has(product.code)) return false
        seen.add(product.code)
        return true
      })

    const category = categories.value.find((item) => item.id === id)

    return {
      categoryId: id,
      category: category?.name || first.category_name || '',
      categoryImage: category?.image || '',
      products,
      total: first.pagination?.total ?? products.length
    }
  }

  async function loadCategory(id: number) {
    if (categoryCache.has(id)) return
    const requestId = ++categoryRequestId
    categoryLoading.value = true
    try {
      const item = await fetchCategorySeries(id)
      categoryCache.set(id, item)
    } catch {
      if (isClient) {
        toast?.add({
          id: 'product-category-error',
          title: '加载失败',
          description: '分类角色加载失败，请稍后重试',
          color: 'error'
        })
      }
    } finally {
      if (requestId === categoryRequestId) categoryLoading.value = false
    }
  }

  function selectCategory(id: number | null) {
    selectedCategoryId.value = id
    categoryRequestId++
    categoryLoading.value = false
    if (id != null) void loadCategory(id)
  }

  /** 切换同维度多选项；品牌选项保存 code。 */
  function toggleFilter(key: ProductFilterKey, option: string) {
    const list = selectedFilters.value[key]
    const index = list.indexOf(option)
    if (index >= 0) {
      list.splice(index, 1)
    } else {
      list.push(option)
    }
  }

  /** 重置品牌及其他属性筛选，保留已选分类。 */
  function clearFilters() {
    selectedFilters.value = createEmptyProductFilters()
  }

  function showAllCategories() {
    selectCategory(null)
  }

  /** 将已选筛选序列化到 URL，品牌多选用逗号分隔 code。 */
  function buildQuery(): Record<string, string> {
    const query: Record<string, string> = {}
    if (selectedCategoryId.value != null) query.category = String(selectedCategoryId.value)
    if (selectedFilters.value.character_type.length > 0) {
      query.type = selectedFilters.value.character_type.join(',')
    }
    if (selectedFilters.value.era.length > 0) {
      query.era = selectedFilters.value.era.join(',')
    }
    if (selectedFilters.value.tag.length > 0) {
      query.tag = selectedFilters.value.tag.join(',')
    }
    if (selectedFilters.value.brand.length > 0) {
      query.brand = selectedFilters.value.brand.join(',')
    }
    return query
  }

  /** 读取页面负责的 URL 参数，保留其他页面参数的既有语义。 */
  function readQuery(): Record<string, string> {
    const query: Record<string, string> = {}
    const raw = route.query as QueryRecord
    const categoryId = parseCategoryId(raw.category)
    if (categoryId != null) query.category = String(categoryId)
    const type = toArray(raw.type)
    if (type.length > 0) query.type = type.join(',')
    const era = toArray(raw.era)
    if (era.length > 0) query.era = era.join(',')
    const tag = toArray(raw.tag)
    if (tag.length > 0) query.tag = tag.join(',')
    const brand = toArray(raw.brand)
    if (brand.length > 0) query.brand = brand.join(',')
    return query
  }

  watch(
    [selectedCategoryId, selectedFilters],
    () => {
      if (!isClient) return
      const next = buildQuery()
      if (sameQuery(next, readQuery())) return
      const merged = { ...(route.query as Record<string, any>) }
      delete merged.category
      delete merged.type
      delete merged.era
      delete merged.tag
      delete merged.brand
      Object.assign(merged, next)
      router.replace({ query: merged })
    },
    { deep: true }
  )

  watch(
    () => route.query,
    (query) => {
      const nextCategoryId = parseCategoryId(query.category)
      const nextFilters = parseFilters(query as QueryRecord)
      if (nextCategoryId !== selectedCategoryId.value) {
        selectedCategoryId.value = nextCategoryId
        if (nextCategoryId != null) void loadCategory(nextCategoryId)
      }
      if (!sameFilters(nextFilters, selectedFilters.value)) {
        selectedFilters.value = nextFilters
      }
    }
  )

  if (isClient) {
    watch(
      catalogError,
      (error) => {
        if (!error) return
        toast?.add({
          id: 'product-catalog-error',
          title: '加载失败',
          description: '角色数据加载失败，请刷新页面重试',
          color: 'error'
        })
      },
      { immediate: true }
    )
  }

  return {
    categories,
    selectedCategoryId,
    selectedFilters,
    filterGroups,
    series,
    activeFilterTags,
    activeFilterCount,
    filteredCharacterCount,
    totalCharacters,
    categoryLoading,
    brandsLoading,
    brandsError,
    hasActiveFilters,
    hasCategoryFilter,
    retryBrands,
    selectCategory,
    toggleFilter,
    clearFilters,
    showAllCategories
  }
}
