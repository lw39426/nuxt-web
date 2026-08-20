/**
 * 获取收藏数量接口
 * GET /api/v1/favorite/count
 * 查询参数: item_type
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { _item_type } = query

  // TODO: 查询收藏数量
  return {
    code: 200,
    message: 'success',
    data: {
      count: 0
    }
  }
})
