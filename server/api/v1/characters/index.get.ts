/**
 * 获取角色列表接口
 * GET /api/v1/characters
 * 查询参数: region_code, page, pageSize
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { _region_code, page = 1, pageSize = 20 } = query

  // TODO: 查询角色列表
  return {
    code: 200,
    message: 'success',
    data: {
      characters: [],
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: 0,
        totalPages: 0
      }
    }
  }
})
