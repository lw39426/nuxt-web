import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, '昵称不能为空').max(24, '昵称最多 24 个字符'),
  username: z
    .string()
    .min(3, '用户名至少 3 个字符')
    .max(20, '用户名最多 20 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  email: z.string().email('请输入有效的邮箱地址'),
  bio: z.string().max(160, '简介最多 160 个字符'),
  gender: z.enum(['male', 'female', 'other', 'secret']),
  birthday: z.string(),
  location: z.string().max(40),
  website: z.union([z.string().url('请输入有效的网址'), z.literal('')])
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse)

  // Mock：真实场景在此写入数据库
  Object.assign(mockProfile, body)

  return { success: true, profile: mockProfile }
})
