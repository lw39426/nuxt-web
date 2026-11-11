import { SEARCH_ERROR_MESSAGE, type SiteSearchResponse } from '#shared/siteSearch'

export default defineEventHandler(async (event): Promise<SiteSearchResponse> => {
  const config = useRuntimeConfig(event)

  try {
    const url = config.apiSearchUrl || new URL('/api/search', config.apiSecretBase).href
    const upstream = await $fetch.raw<SiteSearchResponse>(url, {
      query: getQuery(event),
      timeout: config.apiTimeout,
      retry: 0,
      ignoreResponseError: true,
      headers: { Accept: 'application/json' }
    })
    if (upstream.status === 200 && upstream._data) return upstream._data
  } catch {
    // A connection failure uses the same response contract as an upstream search error.
  }

  setResponseStatus(event, 500)
  return { code: 500, message: SEARCH_ERROR_MESSAGE, msg: SEARCH_ERROR_MESSAGE, data: null }
})
