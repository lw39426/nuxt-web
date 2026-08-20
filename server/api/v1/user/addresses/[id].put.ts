/**
 * 编辑地址接口
 * PUT /api/v1/user/addresses/:id
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // TODO: 更新数据库中的地址
  return {
    code: 200,
    message: '地址更新成功',
    data: {
      id: Number(id),
      ...body
    }
  }
})
