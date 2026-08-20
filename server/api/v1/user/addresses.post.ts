import { createError } from 'h3'

/**
 * 新增地址接口
 * POST /api/v1/user/addresses
 * 请求体: { recipient_name: string, phone: string, address_line: string, is_default?: boolean }
 * 需要鉴权
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { recipient_name, phone, address_line, is_default } = body

  if (!recipient_name || !phone || !address_line) {
    throw createError({
      statusCode: 400,
      statusMessage: '请填写完整的地址信息'
    })
  }

  // TODO: 插入地址到数据库
  return {
    code: 200,
    message: '地址添加成功',
    data: {
      id: Date.now(),
      recipient_name,
      phone,
      address_line,
      is_default: is_default || false
    }
  }
})
