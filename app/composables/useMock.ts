import type { ApiResponse } from '~/composables/useApi'

/**
 * 前端本地 Mock 数据与方法
 */
export function useMock() {
  /**
   * Mock 分类数据
   */
  async function getCategories(): Promise<ApiResponse<any[]>> {
    const data = [
      {
        id: 1,
        name: '数码电子',
        children: [
          { id: 11, name: '手机' },
          { id: 12, name: '电脑' },
          { id: 13, name: '智能穿戴' }
        ]
      },
      {
        id: 2,
        name: '家居生活',
        children: [
          { id: 21, name: '收纳' },
          { id: 22, name: '清洁' }
        ]
      },
      {
        id: 3,
        name: '美妆个护',
        children: [
          { id: 31, name: '护肤' },
          { id: 32, name: '彩妆' }
        ]
      },
      {
        id: 4,
        name: '运动户外',
        children: [
          { id: 41, name: '跑步' },
          { id: 42, name: '骑行' }
        ]
      }
    ]
    return { code: 200, message: 'success', data }
  }

  /**
   * Mock 商品搜索
   */
  async function searchProducts(params: {
    q?: string
    categoryId?: number
    minPrice?: number
    maxPrice?: number
    sort?: 'price_asc' | 'price_desc' | 'latest' | 'popular'
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ items: any[]; page: number; pageSize: number; total: number }>> {
    const all = [
      { id: 101, name: 'iPhone 15', price: 6999, cover: '/images/placeholder.svg', categoryId: 11 },
      {
        id: 102,
        name: 'MacBook Air',
        price: 8999,
        cover: '/images/placeholder.svg',
        categoryId: 12
      },
      {
        id: 103,
        name: '扫地机器人',
        price: 1599,
        cover: '/images/placeholder.svg',
        categoryId: 22
      },
      { id: 104, name: '跑步鞋', price: 499, cover: '/images/placeholder.svg', categoryId: 41 },
      { id: 105, name: '骑行头盔', price: 299, cover: '/images/placeholder.svg', categoryId: 42 },
      { id: 106, name: '智能手表', price: 1299, cover: '/images/placeholder.svg', categoryId: 13 }
    ]
    const page = params.page || 1
    const pageSize = params.pageSize || 12
    let items = all.filter((p) => {
      const matchQ = params.q ? p.name.toLowerCase().includes(params.q.toLowerCase()) : true
      const matchCat = params.categoryId ? p.categoryId === params.categoryId : true
      const matchMin = typeof params.minPrice === 'number' ? p.price >= params.minPrice : true
      const matchMax = typeof params.maxPrice === 'number' ? p.price <= params.maxPrice : true
      return matchQ && matchCat && matchMin && matchMax
    })
    if (params.sort === 'price_asc') items = items.sort((a, b) => a.price - b.price)
    else if (params.sort === 'price_desc') items = items.sort((a, b) => b.price - a.price)
    else if (params.sort === 'latest') items = items.sort((a, b) => b.id - a.id)
    const total = items.length
    const start = (page - 1) * pageSize
    const pageItems = items.slice(start, start + pageSize)
    return { code: 200, message: 'success', data: { items: pageItems, page, pageSize, total } }
  }

  /**
   * Mock 商品详情
   */
  async function getProductDetail(id: number): Promise<ApiResponse<any>> {
    const map: Record<number, any> = {
      101: {
        id: 101,
        name: 'iPhone 15',
        price: 6999,
        cover: '/images/placeholder.svg',
        description: 'Apple 最新款智能手机，性能强劲。'
      },
      102: {
        id: 102,
        name: 'MacBook Air',
        price: 8999,
        cover: '/images/placeholder.svg',
        description: '轻薄便携的笔记本电脑，适合办公与创作。'
      }
    }
    const data = map[id] || {
      id,
      name: '未知商品',
      price: 0,
      cover: '/images/placeholder.svg',
      description: '暂无描述'
    }
    return { code: 200, message: 'success', data }
  }

  /**
   * Mock 最新文章
   */
  async function getLatestArticles(): Promise<ApiResponse<any[]>> {
    const data = [
      { id: 201, title: '数码潮流趋势', summary: '探索今年热门数码产品与技术变革。' },
      { id: 202, title: '居家收纳指南', summary: '让家更整洁的实用收纳技巧。' },
      { id: 203, title: '跑步入门教程', summary: '如何科学跑步，避免受伤。' }
    ]
    return { code: 200, message: 'success', data }
  }

  /**
   * Mock 文章列表
   */
  async function listArticles(params: {
    q?: string
    sort?: 'latest' | 'hot'
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ items: any[]; page: number; pageSize: number; total: number }>> {
    let items = [
      { id: 201, title: '数码潮流趋势', summary: '探索今年热门数码产品与技术变革。' },
      { id: 202, title: '居家收纳指南', summary: '让家更整洁的实用收纳技巧。' },
      { id: 203, title: '跑步入门教程', summary: '如何科学跑步，避免受伤。' },
      { id: 204, title: '彩妆新手必看', summary: '五分钟打造日常通勤妆。' }
    ]
    if (params.q)
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(params.q!.toLowerCase()) ||
          (a.summary || '').toLowerCase().includes(params.q!.toLowerCase())
      )
    if (params.sort === 'latest') items = items.sort((a, b) => b.id - a.id)
    const page = params.page || 1
    const pageSize = params.pageSize || 12
    const total = items.length
    const start = (page - 1) * pageSize
    const pageItems = items.slice(start, start + pageSize)
    return { code: 200, message: 'success', data: { items: pageItems, page, pageSize, total } }
  }

  /**
   * Mock 文章详情
   */
  async function getArticleDetail(id: number): Promise<ApiResponse<any>> {
    const data = {
      id,
      title: `示例文章 ${id}`,
      summary: '这是一篇示例文章摘要。',
      content: '<p>这里是完整文章内容的 HTML 示例。</p><p>可包含图片、列表等富文本。</p>'
    }
    return { code: 200, message: 'success', data }
  }

  /**
   * Mock 相关文章
   */
  async function getRelatedArticles(id: number): Promise<ApiResponse<any[]>> {
    const data = [
      { id: id + 1, title: '相关主题 A' },
      { id: id + 2, title: '相关主题 B' },
      { id: id + 3, title: '相关主题 C' }
    ]
    return { code: 200, message: 'success', data }
  }

  return {
    getCategories,
    searchProducts,
    getProductDetail,
    getLatestArticles,
    listArticles,
    getArticleDetail,
    getRelatedArticles
  }
}
