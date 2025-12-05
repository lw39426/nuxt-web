import { getMockProducts } from '../../../../utils/mockProducts'

export default defineEventHandler(async (event) => {
  /**
   * 商品搜索（Mock），支持 q、categoryId、minPrice、maxPrice、sort、page、pageSize、brand、memory
   */
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const pageSize = Number(query.pageSize || 12)
  const q = String(query.q || '').toLowerCase()
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined
  const sort = String(query.sort || '') as 'price_asc' | 'price_desc' | 'latest' | 'popular' | ''
  const brand = query.brand ? String(query.brand).split(',') : undefined
  const memory = query.memory ? String(query.memory).split(',') : undefined

  // Use the shared mock data generator
  const all = getMockProducts()

  let items = all.filter((p) => {
    const matchQ = q ? p.title.toLowerCase().includes(q) : true
    const matchCat = categoryId ? p.categoryId === categoryId : true
    const matchMin = typeof minPrice === 'number' ? p.price >= minPrice : true
    const matchMax = typeof maxPrice === 'number' ? p.price <= maxPrice : true

    // Handle multiple brands selection
    const matchBrand =
      brand && brand.length > 0
        ? brand.some((b) => p.brand.toLowerCase() === b.toLowerCase())
        : true

    // Handle multiple memory selection
    const matchMemory =
      memory && memory.length > 0
        ? memory.some((m) => p.memory && p.memory.toLowerCase() === m.toLowerCase())
        : true

    return matchQ && matchCat && matchMin && matchMax && matchBrand && matchMemory
  })

  if (sort === 'price_asc') items = items.sort((a, b) => a.price - b.price)
  else if (sort === 'price_desc') items = items.sort((a, b) => b.price - a.price)
  else if (sort === 'latest') items = items.sort((a, b) => b.id - a.id)
  // popular could be based on rating or reviewCount
  else if (sort === 'popular') items = items.sort((a, b) => b.reviewCount - a.reviewCount)

  const total = items.length
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return {
    code: 200,
    message: 'success',
    data: { items: pageItems, page, pageSize, total },
    total,
    timestamp: new Date().toISOString()
  }
})
