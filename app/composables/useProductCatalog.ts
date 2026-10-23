import { computed, onMounted, reactive, ref, watch } from 'vue'
import type {
  ProductCatalogFilters,
  ProductCategory,
  ProductFilterKey,
  ProductSeriesGroup
} from '~/types/product'
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

function parseFilters(query: QueryRecord): ProductCatalogFilters {
  return {
    character_type: toArray(query.type),
    era: toArray(query.era),
    tag: toArray(query.tag)
  }
}

function sameArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((item) => set.has(item))
}

function sameFilters(a: ProductCatalogFilters, b: ProductCatalogFilters): boolean {
  return (
    sameArray(a.character_type, b.character_type) &&
    sameArray(a.era, b.era) &&
    sameArray(a.tag, b.tag)
  )
}

function sameQuery(a: Record<string, string>, b: Record<string, string>): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => a[key] === b[key])
}

export async function useProductCatalog() {
  const route = useRoute()
  const router = useRouter()
  const toast = import.meta.client ? useToast() : null
  const { getProductCatalog, getProducts } = useCategoryApi()

  const selectedCategoryId = ref<number | null>(parseCategoryId(route.query.category))
  const selectedFilters = ref<ProductCatalogFilters>(parseFilters(route.query as QueryRecord))
  const categoryCache = reactive(new Map<number, ProductSeriesGroup>())
  const categoryLoading = ref(false)
  let categoryRequestId = 0

  onMounted(() => {
    const id = selectedCategoryId.value
    if (id != null) void loadCategory(id)
  })

  const { data: catalogData, error: catalogError } = await useAsyncData(
    'product-catalog',
    () => getProductCatalog(),
    {
      default: () => ({ categories: [] as ProductCategory[], series: [] as ProductSeriesGroup[] })
    }
  )

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

  const filterGroups = computed(() => buildProductFilterGroups(allProducts.value))
  const series = computed(() => applyProductFilters(activeSeries.value, selectedFilters.value))
  const activeFilterTags = computed(() => buildActiveFilterTags(selectedFilters.value))
  const activeFilterCount = computed(() => countActiveFilters(selectedFilters.value))
  const filteredCharacterCount = computed(() => countSeriesProducts(series.value))
  const totalCharacters = computed(() =>
    allSeries.value.reduce((sum, item) => sum + (item.total || item.products.length), 0)
  )
  const hasActiveFilters = computed(() => activeFilterCount.value > 0)
  const hasCategoryFilter = computed(() => selectedCategoryId.value != null)

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
      if (import.meta.client) {
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

  function toggleFilter(key: ProductFilterKey, option: string) {
    const list = selectedFilters.value[key]
    const index = list.indexOf(option)
    if (index >= 0) {
      list.splice(index, 1)
    } else {
      list.push(option)
    }
  }

  function clearFilters() {
    selectedFilters.value = createEmptyProductFilters()
  }

  function showAllCategories() {
    selectCategory(null)
  }

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
    return query
  }

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
    return query
  }

  watch(
    [selectedCategoryId, selectedFilters],
    () => {
      if (!import.meta.client) return
      const next = buildQuery()
      if (sameQuery(next, readQuery())) return
      const merged = { ...(route.query as Record<string, any>) }
      delete merged.category
      delete merged.type
      delete merged.era
      delete merged.tag
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

  if (import.meta.client) {
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
    hasActiveFilters,
    hasCategoryFilter,
    selectCategory,
    toggleFilter,
    clearFilters,
    showAllCategories
  }
}
