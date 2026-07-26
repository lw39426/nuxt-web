import type { Product } from '~/types/product'
import type { Article } from '~/types/blog'
import type { Pagination } from '~/types/api'

/** Banner 对象 */
export interface Banner {
  id: number
  title: string
  image_url: string
  placement_key: string
  link_type: string
  link_target: string
  client_type: string
  sort_order: number
  status: boolean
}

/** 公告对象 */
export interface Announcement {
  id: number
  title: string
  announcement_type: string
  content: string
  display_positions: string[]
  force_reminder: boolean
  terminals: string[]
  effective_time: string
  end_time: string
  created_at: string
}

/** 首页分类（含商品数量） */
export interface HomeCategory {
  id: number
  name: string
  image: string
  product_count: number
  children: HomeCategory[]
}

/** 首页聚合数据 */
export interface HomeData {
  banners: Banner[]
  categories: HomeCategory[]
  featured: {
    tag_name: string
    products: Product[]
  }
  hot_products: Product[]
  articles: Article[]
  new_products: Product[]
}

/** 标签对象 */
export interface Tag {
  id: number
  name: string
  color: string
  weight: number
  type: number
  description: string
}

/**
 * 首页模块 API 封装
 * 无鉴权要求
 */
export function useHomeApi() {
  const { get } = useApi()

  /**
   * 获取首页聚合数据
   * GET /home/data
   */
  async function getHomeData() {
    return await get<HomeData>('/home/data')
  }

  /**
   * 获取 Banner 轮播图
   * GET /banners
   */
  async function getBanners(params: { placement_key: string; client_type?: string }) {
    return await get<{ banners: Banner[]; source: string; cache_key: string; cached: boolean }>(
      '/banners',
      params
    )
  }

  /**
   * 获取公告列表
   * GET /announcements
   */
  async function getAnnouncements(params?: {
    position?: string
    terminal?: string
    announcement_type?: string
    force_only?: boolean
  }) {
    return await get<Announcement[]>('/announcements', params)
  }

  /**
   * 获取首页商品分类
   * GET /home/categories
   */
  async function getHomeCategories() {
    return await get<HomeCategory[]>('/home/categories')
  }

  /**
   * 获取精选商品
   * GET /home/featured-products
   */
  async function getFeaturedProducts(params?: { page?: number; pageSize?: number }) {
    return await get<{
      tag_name: string
      tag_color: string
      products: Product[]
      pagination: Pagination
    }>('/home/featured-products', params)
  }

  /**
   * 获取热门商品
   * GET /home/hot-products
   */
  async function getHotProducts(params?: { page?: number; pageSize?: number }) {
    return await get<{ products: Product[]; pagination: Pagination }>('/home/hot-products', params)
  }

  /**
   * 获取推荐文章
   * GET /home/articles
   */
  async function getHomeArticles(params?: {
    page?: number
    pageSize?: number
    category_id?: number
  }) {
    return await get<{ articles: Article[]; pagination: Pagination }>('/home/articles', params)
  }

  /**
   * 获取新品推荐
   * GET /new-products
   */
  async function getNewProducts(params?: { page?: number; pageSize?: number }) {
    return await get<{ products: Product[]; pagination: Pagination }>('/new-products', params)
  }

  /**
   * 获取标签列表
   * GET /tags
   */
  async function getTags(type?: number) {
    return await get<Tag[]>('/tags', type !== undefined ? { type } : undefined)
  }

  return {
    getHomeData,
    getBanners,
    getAnnouncements,
    getHomeCategories,
    getFeaturedProducts,
    getHotProducts,
    getHomeArticles,
    getNewProducts,
    getTags
  }
}
