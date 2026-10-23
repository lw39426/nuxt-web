import type {
  Product,
  ProductActiveFilterTag,
  ProductCatalogFilters,
  ProductFilterKey,
  ProductFilterOptionGroup,
  ProductSeriesGroup
} from '~/types/product'

const FILTER_LABELS: Record<ProductFilterKey, string> = {
  character_type: '类型',
  era: '年代',
  tag: '标签'
}

const ERA_ORDER = ['40年代', '80年代', '90年代', '00年代', '10年代', '20年代']

export function createEmptyProductFilters(): ProductCatalogFilters {
  return {
    character_type: [],
    era: [],
    tag: []
  }
}

export function buildProductFilterGroups(products: Product[]): ProductFilterOptionGroup[] {
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
    { key: 'character_type', label: FILTER_LABELS.character_type, options: [...types] },
    { key: 'era', label: FILTER_LABELS.era, options: sortedEras },
    { key: 'tag', label: FILTER_LABELS.tag, options: [...tags] }
  ]
}

export function applyProductFilters(
  series: ProductSeriesGroup[],
  filters: ProductCatalogFilters
): ProductSeriesGroup[] {
  const { character_type: types, era: eras, tag: tags } = filters
  const hasFilter = types.length > 0 || eras.length > 0 || tags.length > 0
  if (!hasFilter) return series

  return series
    .map((item) => ({
      ...item,
      products: item.products.filter((product) => {
        if (types.length > 0 && !types.includes(product.character_type || '')) return false
        if (eras.length > 0 && !eras.includes(product.era || '')) return false
        if (tags.length > 0 && !product.tags?.some((tag) => tags.includes(tag.name))) return false
        return true
      })
    }))
    .filter((item) => item.products.length > 0)
}

export function buildActiveFilterTags(filters: ProductCatalogFilters): ProductActiveFilterTag[] {
  return (Object.keys(filters) as ProductFilterKey[]).flatMap((key) =>
    filters[key].map((value) => ({
      key,
      label: FILTER_LABELS[key],
      value
    }))
  )
}

export function countActiveFilters(filters: ProductCatalogFilters): number {
  return filters.character_type.length + filters.era.length + filters.tag.length
}

export function countSeriesProducts(series: ProductSeriesGroup[]): number {
  return series.reduce((sum, item) => sum + item.products.length, 0)
}
