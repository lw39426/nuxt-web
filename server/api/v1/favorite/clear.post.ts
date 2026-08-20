/**
 * 清空收藏接口
 * POST /api/v1/favorite/clear
 * 请求体: { item_type?: string }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { _item_type } = body

  // TODO: 清空收藏
  return {
    code: 200,
    message: '收藏已清空'
  }
})
