import type { Pagination } from '~/types/api'

/** 订单状态枚举 */
export type OrderStatus = 0 | 1 | 2 | 3 | 4 // 0-待支付 1-已支付 2-已发货 3-已完成 4-已取消

/** 订单简要信息 */
export interface OrderBrief {
  id: number
  order_no: string
  total_amount: number
  status: OrderStatus
  created_at: string
}

/** 订单项 */
export interface OrderItem {
  product_id: number
  product_name: string
  product_image: string
  price: number
  quantity: number
}

/** 订单详情 */
export interface OrderDetail extends OrderBrief {
  items: OrderItem[]
  address_id: number
  remark: string
}

/** 创建订单请求体 */
export interface CreateOrderPayload {
  address_id: number
  items: { product_id: number; quantity: number }[]
  remark?: string
}

/** 创建订单响应 */
export interface CreateOrderResult {
  order_id: number
  order_no: string
  total_amount: number
}

/** 支付订单请求体 */
export interface PayOrderPayload {
  payment_method: 'wechat' | 'alipay' | string
  amount: number
}

/** 订单列表查询参数 */
export interface OrderListParams {
  page?: number
  pageSize?: number
  status?: OrderStatus
}

/**
 * 订单模块 API 封装
 * 前缀: /orders
 * 需要鉴权
 */
export function useOrderApi() {
  const { get, post } = useApi()

  /**
   * 创建订单
   * POST /orders
   */
  async function create(payload: CreateOrderPayload) {
    return await post<CreateOrderResult>('/orders', payload)
  }

  /**
   * 获取订单列表
   * GET /orders
   */
  async function list(params?: OrderListParams) {
    return await get<{ orders: OrderBrief[]; pagination: Pagination }>('/orders', params)
  }

  /**
   * 获取订单详情
   * GET /orders/<order_id>
   */
  async function detail(orderId: number) {
    return await get<OrderDetail>(`/orders/${orderId}`)
  }

  /**
   * 取消订单
   * POST /orders/<order_id>/cancel
   */
  async function cancel(orderId: number) {
    return await post<null>(`/orders/${orderId}/cancel`)
  }

  /**
   * 支付订单
   * POST /orders/<order_id>/pay
   */
  async function pay(orderId: number, payload: PayOrderPayload) {
    return await post<null>(`/orders/${orderId}/pay`, payload)
  }

  /**
   * 确认收货
   * POST /orders/<order_id>/confirm
   */
  async function confirm(orderId: number) {
    return await post<null>(`/orders/${orderId}/confirm`)
  }

  return { create, list, detail, cancel, pay, confirm }
}
