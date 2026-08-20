/**
 * 设置默认地址接口
 * PUT /api/v1/user/addresses/:id/setDefault
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')

  // TODO: 更新数据库中的默认地址
  return {
    code: 200,
    message: '默认地址设置成功'
  }
})
