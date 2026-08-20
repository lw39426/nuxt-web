/**
 * 获取订单详情接口
 * GET /api/v1/orders/:id
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // TODO: 查询订单详情
  return {
    code: 200,
    message: 'success',
    data: {
      id: Number(id),
      order_no: 'ORDER' + id,
      total_amount: 0,
      status: 0,
      items: [],
      address_id: 0,
      remark: '',
      created_at: '2024-01-01 00:00:00'
    }
  }
})
