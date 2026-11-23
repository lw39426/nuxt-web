import type {
  Product,
  ProductActiveFilterTag,
  ProductBrand,
  ProductCatalogFilters,
  ProductFilterKey,
  ProductFilterOptionGroup,
  ProductSeriesGroup
} from '~/types/product'

const FILTER_LABELS: Record<ProductFilterKey, string> = {
  character_type: '类型',
  era: '年代',
  tag: '标签',
  brand: '品牌'
}

const ERA_ORDER = ['40年代', '80年代', '90年代', '00年代', '10年代', '20年代']

/** 创建包含品牌维度的空筛选状态。 */
export function createEmptyProductFilters(): ProductCatalogFilters {
  return {
    character_type: [],
    era: [],
    tag: [],
    brand: []
  }
}

/** 聚合角色属性选项；品牌候选项只取自真实品牌列表。 */
export function buildProductFilterGroups(
  products: Product[],
  brands: ProductBrand[] = []
): ProductFilterOptionGroup[] {
  const types = new Set<string>()
  const eras = new Set<string>()
  const tags = new Set<string>()

  products.forEach((product) => {
    if (product.character_type) types.add(product.character_type)
    if (product.era) eras.add(product.era)
    product.tags?.forEach((tag) => tags.add(tag.name))
  })

  const sortedEras = ERA_ORDER.filter((era) => eras.has(era))

  return [
    {
      key: 'character_type',
      label: FILTER_LABELS.character_type,
      options: [...types].map((value) => ({ value, label: value }))
    },
    {
      key: 'era',
      label: FILTER_LABELS.era,
      options: sortedEras.map((value) => ({ value, label: value }))
    },
    {
      key: 'tag',
      label: FILTER_LABELS.tag,
      options: [...tags].map((value) => ({ value, label: value }))
    },
    {
      key: 'brand',
      label: FILTER_LABELS.brand,
      options: brands.map((brand) => ({ value: brand.code, label: brand.name }))
    }
  ]
}

/** 同维度按 OR、跨维度按 AND 筛选，品牌只匹配商品的 brand.code。 */
export function applyProductFilters(
  series: ProductSeriesGroup[],
  filters: ProductCatalogFilters
): ProductSeriesGroup[] {
  const { character_type: types, era: eras, tag: tags, brand: brands } = filters
  const hasFilter = types.length > 0 || eras.length > 0 || tags.length > 0 || brands.length > 0
  if (!hasFilter) return series

  return series
    .map((item) => ({
      ...item,
      products: item.products.filter((product) => {
        if (types.length > 0 && !types.includes(product.character_type || '')) return false
        if (eras.length > 0 && !eras.includes(product.era || '')) return false
        if (tags.length > 0 && !product.tags?.some((tag) => tags.includes(tag.name))) return false
        if (brands.length > 0 && !brands.includes(product.brand?.code || '')) return false
        return true
      })
    }))
    .filter((item) => item.products.length > 0)
}

/** 已选品牌展示名称，保留 code 用于取消筛选及 URL 同步。 */
export function buildActiveFilterTags(
  filters: ProductCatalogFilters,
  brands: ProductBrand[] = []
): ProductActiveFilterTag[] {
  const brandNames = new Map(brands.map((brand) => [brand.code, brand.name]))
  return (Object.keys(filters) as ProductFilterKey[]).flatMap((key) =>
    filters[key].map((value) => ({
      key,
      label: FILTER_LABELS[key],
      value,
      displayValue: key === 'brand' ? brandNames.get(value) || value : value
    }))
  )
}

/** 统计所有维度已选项，包括品牌多选。 */
export function countActiveFilters(filters: ProductCatalogFilters): number {
  return (
    filters.character_type.length + filters.era.length + filters.tag.length + filters.brand.length
  )
}

export function countSeriesProducts(series: ProductSeriesGroup[]): number {
  return series.reduce((sum, item) => sum + item.products.length, 0)
}
