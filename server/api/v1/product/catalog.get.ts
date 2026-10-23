import type { H3Event } from 'h3'
import type { Product } from '~/types/product'
import { getMockStoreCategories, getSeriesProductsByCategoryId } from '../../../utils/mockStoreData'
import { normalizeProductList } from '../../../utils/product'

const CATALOG_PAGE_SIZE = 200

interface BackendCategory {
  id: number
  name: string
  imageUrl?: string
}

interface BackendProductPage {
  products?: Record<string, unknown>[]
  pagination?: {
    pages?: number
    total?: number
    pageSize?: number
  }
}

interface CatalogCategory {
  id: number
  name: string
  image: string
}

interface CatalogSeries {
  categoryId: number
  category: string
  categoryImage: string
  products: Product[]
  total: number
}

function buildMockCatalog() {
  const categories: CatalogCategory[] = getMockStoreCategories().map((item) => ({
    id: item.id,
    name: item.name,
    image: item.imageUrl
  }))

  const series = categories
    .map((category) => {
      const products = normalizeProductList(getSeriesProductsByCategoryId(category.id))
      return {
        categoryId: category.id,
        category: category.name,
        categoryImage: category.image,
        products,
        total: products.length
      }
    })
    .filter((item) => item.products.length > 0)

  return { categories, series }
}

async function fetchBackendProducts(event: H3Event) {
  const first = await proxyToBackend<BackendProductPage>(event, '/product/search', {
    query: { page: 1, pageSize: CATALOG_PAGE_SIZE }
  })
  const pagination = first.data?.pagination
  const pageSize = Number(pagination?.pageSize) || CATALOG_PAGE_SIZE
  const total = Number(pagination?.total) || 0
  const pages = Number(pagination?.pages) || (total > 0 ? Math.ceil(total / pageSize) : 1)
  const rest =
    pages > 1
      ? await Promise.all(
          Array.from({ length: pages - 1 }, (_, index) =>
            proxyToBackend<BackendProductPage>(event, '/product/search', {
              query: { page: index + 2, pageSize: CATALOG_PAGE_SIZE }
            })
          )
        )
      : []

  const seen = new Set<string>()
  return [first, ...rest]
    .flatMap((response) => (Array.isArray(response.data?.products) ? response.data.products : []))
    .filter((product) => {
      const key = String(product.code || product.id || '')
      if (!key) return true
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

async function buildBackendCatalog(event: H3Event) {
  const [categoryResponse, rawProducts] = await Promise.all([
    proxyToBackend<BackendCategory[]>(event, '/product/category/list'),
    fetchBackendProducts(event)
  ])

  const categories: CatalogCategory[] = (
    Array.isArray(categoryResponse.data) ? categoryResponse.data : []
  ).map((item) => ({
    id: item.id,
    name: item.name,
    image: item.imageUrl || ''
  }))

  const products = normalizeProductList(rawProducts)
  const grouped = new Map<number, typeof products>()

  products.forEach((product) => {
    const list = grouped.get(product.category_id) || []
    list.push(product)
    grouped.set(product.category_id, list)
  })

  const series: CatalogSeries[] = categories
    .map((category) => {
      const categoryProducts = grouped.get(category.id) || []
      return {
        categoryId: category.id,
        category: category.name,
        categoryImage: category.image,
        products: categoryProducts,
        total: categoryProducts.length
      }
    })
    .filter((item) => item.products.length > 0)

  return { categories, series }
}

export default defineEventHandler(async (event) => {
  if (isMockMode()) {
    setResponseHeader(event, 'X-Data-Source', 'mock')
    return { code: 200, message: 'success', data: buildMockCatalog() }
  }

  try {
    const data = await buildBackendCatalog(event)
    setResponseHeader(event, 'X-Data-Source', 'backend')
    return { code: 200, message: 'success', data }
  } catch (error: any) {
    console.error('[BFF] /product/catalog 聚合失败:', error?.message || error)
    setResponseHeader(event, 'X-Data-Source', 'mock')
    return { code: 200, message: 'success', data: buildMockCatalog() }
  }
})
