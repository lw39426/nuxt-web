export default defineEventHandler(async (event) => {
  const body = await readFormData(event)
  if (!body.get('file')) throw createError({ statusCode: 400, statusMessage: '请选择图片' })
  return proxyOnly(event, '/user/avatar', { body })
})
