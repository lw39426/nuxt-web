/**
 * 兜底透传路由
 * ALL /api/v1/**
 *
 * 作用：覆盖尚未单独实现 BFF 文件的接口（如 /auth/getCode、/banners、/tags 等），
 * 原样把请求方法、查询参数、请求体与鉴权头透传给 Flask 后端。
 *
 * 优先级说明：Nitro 中具体路由（含动态参数）优先级高于 catch-all，
 * 因此本文件只会在没有匹配到任何显式路由时生效。
 * 由于无法为未知接口预置 Mock，这里使用 proxyOnly，不做降级。
 */
export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path') || ''

  if (!path) {
    throw createError({
      statusCode: 404,
      statusMessage: '接口不存在'
    })
  }

  return proxyOnly<unknown>(event, `/${path}`)
})
