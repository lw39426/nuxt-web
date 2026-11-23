export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path') || ''
  if (!/^rooms(?:\/\d+(?:\/(?:messages|read))?)?$/.test(path)) {
    throw createError({ statusCode: 404 })
  }
  const origin = new URL(useRuntimeConfig(event).apiSecretBase).origin
  const query = getRequestURL(event).search
  return proxyRequest(event, `${origin}/chat-system/chat/${path}${query}`)
})
