/**
 * 删除地址接口
 * DELETE /api/v1/user/addresses/:id
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')

  // TODO: 从数据库删除地址
  return {
    code: 200,
    message: '地址删除成功'
  }
})
