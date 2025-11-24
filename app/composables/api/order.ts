export interface OrderBrief {
  id: number
  amount: number
  status: 'pending' | 'paid' | 'canceled' | 'completed'
  createdAt: string
}

export interface OrderItem {
  id: number
  productId: number
  title: string
  price: number
  quantity: number
}

export interface OrderDetail extends OrderBrief {
  items: OrderItem[]
}

export interface CreateOrderPayload {
  items: { productId: number; quantity: number }[]
  addressId?: number
}

/**
 * 订单模块 API 封装
 */
export function useOrderApi() {
  const { get, post } = useApi()

  /**
   * 创建订单（POST /miniapp/api/orders）
   */
  async function create(payload: CreateOrderPayload) {
    return await post<OrderBrief>('/miniapp/api/orders', payload)
  }

  /**
   * 获取订单列表（GET /miniapp/api/orders）
   */
  async function list(page?: number, pageSize?: number) {
    return await get<{ items: OrderBrief[]; page: number; pageSize: number; total: number }>(
      '/miniapp/api/orders',
      { page, pageSize }
    )
  }

  /**
   * 获取订单详情（GET /miniapp/api/orders/<id>）
   */
  async function detail(orderId: number) {
    return await get<OrderDetail>(`/miniapp/api/orders/${orderId}`)
  }

  /**
   * 取消订单（POST /miniapp/api/orders/<id>/cancel）
   */
  async function cancel(orderId: number) {
    return await post<null>(`/miniapp/api/orders/${orderId}/cancel`)
  }

  /**
   * 支付订单（POST /miniapp/api/orders/<id>/pay）
   */
  async function pay(orderId: number) {
    return await post<null>(`/miniapp/api/orders/${orderId}/pay`)
  }

  /**
   * 确认收货（POST /miniapp/api/orders/<id>/confirm）
   */
  async function confirm(orderId: number) {
    return await post<null>(`/miniapp/api/orders/${orderId}/confirm`)
  }

  return { create, list, detail, cancel, pay, confirm }
}
