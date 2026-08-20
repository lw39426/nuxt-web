/**
 * 获取角色详情接口
 * GET /api/v1/characters/:code
 */
export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  // TODO: 查询角色详情
  return {
    code: 200,
    message: 'success',
    data: {
      id: '1',
      code,
      name: '示例角色',
      description: '角色描述',
      avatar_url: '',
      region_code: '',
      element: ''
    }
  }
})
