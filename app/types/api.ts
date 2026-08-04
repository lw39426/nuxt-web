/**
 * 通用 API 类型定义
 * 对应接口文档中的统一响应格式与分页约定
 */

/** 统一分页对象 */
export interface Pagination {
  page: number
  pageSize: number
  total: number
  pages: number
}

/** 带分页的列表响应数据 */
export interface PaginatedResponse<T> {
  list: T[]
  pagination: Pagination
}

/** 分页请求参数 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/** 统一 API 响应 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp?: string
}
