export default defineEventHandler(async (event) => {
  /**
   * 商品搜索（Mock），支持 q、categoryId、minPrice、maxPrice、sort、page、pageSize
   */
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const pageSize = Number(query.pageSize || 12)
  const q = String(query.q || '').toLowerCase()
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined
  const sort = String(query.sort || '') as 'price_asc' | 'price_desc' | 'latest' | 'popular' | ''

  const all = [
    { id: 101, name: 'iPhone 15', price: 6999, cover: '/images/placeholder.svg', categoryId: 11 },
    { id: 102, name: 'MacBook Air', price: 8999, cover: '/images/placeholder.svg', categoryId: 12 },
    { id: 103, name: '扫地机器人', price: 1599, cover: '/images/placeholder.svg', categoryId: 22 },
    { id: 104, name: '跑步鞋', price: 499, cover: '/images/placeholder.svg', categoryId: 41 },
    { id: 105, name: '骑行头盔', price: 299, cover: '/images/placeholder.svg', categoryId: 42 },
    { id: 106, name: '智能手表', price: 1299, cover: '/images/placeholder.svg', categoryId: 13 }
  ]

  let items = all.filter((p) => {
    const matchQ = q ? p.name.toLowerCase().includes(q) : true
    const matchCat = categoryId ? p.categoryId === categoryId : true
    const matchMin = typeof minPrice === 'number' ? p.price >= minPrice : true
    const matchMax = typeof maxPrice === 'number' ? p.price <= maxPrice : true
    return matchQ && matchCat && matchMin && matchMax
  })

  if (sort === 'price_asc') items = items.sort((a, b) => a.price - b.price)
  else if (sort === 'price_desc') items = items.sort((a, b) => b.price - a.price)
  else if (sort === 'latest') items = items.sort((a, b) => b.id - a.id)

  const total = items.length
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return {
    code: 200,
    message: 'success',
    data: { items: pageItems, page, pageSize, total },
    timestamp: new Date().toISOString()
  }
})
