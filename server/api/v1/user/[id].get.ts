export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    throw createError({ statusCode: 400, statusMessage: '无效的用户 ID' })
  }
  return proxyOnly(event, `/user/${id}`, { forwardCookie: false })
})
