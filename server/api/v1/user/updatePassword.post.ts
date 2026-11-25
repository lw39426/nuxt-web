export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (
    typeof body?.oldPassword !== 'string' ||
    !body.oldPassword ||
    typeof body?.newPassword !== 'string' ||
    body.newPassword.length < 6 ||
    body.newPassword.length > 128
  ) {
    throw createError({ statusCode: 400, statusMessage: '请填写原密码，新密码须为 6–128 个字符' })
  }
  return proxyOnly<null>(event, '/user/updatePassword', {
    body: {
      oldPassword: body.oldPassword,
      newPassword: body.newPassword
    }
  })
})
