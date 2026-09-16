import { getMockCollectedSet } from '../../../utils/mockUserState'
import { getMockProductList } from '../../../utils/mockStoreData'

/**
 * 收集/取消收集角色接口（切换）
 * POST /api/v1/collection/toggle
 * 请求体: { character_id: number }
 * Mock 模式下写内存；代理模式下转发 Flask
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.character_id) {
    throw createError({
      statusCode: 400,
      statusMessage: '角色 ID 不能为空'
    })
  }

  const userId = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'

  /** Mock 路径：切换收集状态 */
  const doMock = () => {
    const set = getMockCollectedSet(userId)
    const id = Number(body.character_id)
    const character = getMockProductList().find((p) => p.id === id)
    if (!character) {
      throw createError({ statusCode: 404, statusMessage: '角色不存在' })
    }
    if (set.has(id)) {
      set.delete(id)
      return { character_id: id, collected: false }
    }
    set.add(id)
    return { character_id: id, collected: true }
  }

  return withMockFallback(event, '/collection/toggle', doMock, { body })
})
