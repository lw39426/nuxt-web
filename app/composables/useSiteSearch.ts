import { useLocalStorage } from '@vueuse/core'
import { SEARCH_CATEGORIES, SEARCH_ERROR_MESSAGE } from '#shared/siteSearch'
import type { SearchEntryType, SiteSearchData, SiteSearchResponse } from '#shared/siteSearch'
import type { RecentItem } from '~/types/search'

const PAGE_SIZE = 10

function isSearchType(value: unknown): value is SearchEntryType {
  return typeof value === 'string' && Object.hasOwn(SEARCH_CATEGORIES, value)
}

function validateKeyword(value: string) {
  if (!value) return '请输入搜索关键词'
  if (Array.from(value).length > 50) return '搜索词最多 50 个字符'
  return ''
}

export function useSiteSearch() {
  const route = useRoute()
  const router = useRouter()
  const keyword = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))
  const type = computed(() => (isSearchType(route.query.type) ? route.query.type : undefined))
  const page = computed(() => {
    const value = route.query.page
    const number = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : 1
    return Number.isSafeInteger(number) && number > 0 ? number : 1
  })
  const draft = shallowRef(keyword.value)
  const validation = shallowRef('')
  const data = shallowRef<SiteSearchData | null>(null)
  const error = shallowRef('')
  const pending = shallowRef(false)
  const retryCount = shallowRef(0)
  const categoryTotals = shallowRef<Partial<Record<SearchEntryType, number>>>({})
  const ready = shallowRef(false)
  const recent = useLocalStorage<RecentItem[]>('search-recent', [], { initOnMounted: true })

  watch(keyword, (value) => {
    draft.value = value
    validation.value = ''
    categoryTotals.value = {}
  })
  watch(draft, () => {
    validation.value = ''
  })

  onMounted(() => {
    ready.value = true
  })

  watch(
    [ready, keyword, type, page, retryCount],
    async ([mounted, q, entryType, currentPage], _previous, onCleanup) => {
      data.value = null
      error.value = ''
      pending.value = false
      if (!mounted || !q) return

      const invalid = validateKeyword(q)
      if (invalid) {
        error.value = invalid
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      pending.value = true
      try {
        const response = await $fetch<SiteSearchResponse>('/api/search', {
          query: { q, type: entryType, page: currentPage, size: PAGE_SIZE },
          signal: controller.signal,
          retry: 0
        })
        if (controller.signal.aborted) return
        if (response.code !== 200 || !response.data) {
          error.value = response.message || response.msg || SEARCH_ERROR_MESSAGE
          return
        }

        data.value = response.data
        const totals: Partial<Record<SearchEntryType, number>> = entryType
          ? { ...categoryTotals.value, [entryType]: 0 }
          : { character: 0, product: 0, article: 0 }
        for (const tab of response.data.tabs) totals[tab.entry_type] = tab.total
        categoryTotals.value = totals
        const existing = recent.value.find((item) => item.keyword === q)
        if (recent.value[0]?.keyword !== q) {
          recent.value = [
            existing ?? { id: q, keyword: q },
            ...recent.value.filter((item) => item.keyword !== q)
          ].slice(0, 8)
        }
      } catch {
        if (!controller.signal.aborted) error.value = SEARCH_ERROR_MESSAGE
      } finally {
        if (!controller.signal.aborted) pending.value = false
      }
    }
  )

  function navigate(q: string, entryType?: SearchEntryType, targetPage = 1) {
    return router.push({
      query: {
        q: q || undefined,
        type: entryType,
        page: targetPage > 1 ? String(targetPage) : undefined
      }
    })
  }

  function submit(value = draft.value) {
    const q = value.trim()
    validation.value = validateKeyword(q)
    if (validation.value) return

    draft.value = q
    if (q === keyword.value && page.value === 1) {
      retryCount.value++
      return
    }
    return navigate(q, type.value)
  }

  return {
    keyword,
    type,
    draft,
    validation,
    data,
    categoryTotals,
    error,
    pending: computed(() => Boolean(keyword.value) && (!ready.value || pending.value)),
    recent,
    submit,
    reset: () => navigate('', type.value),
    retry: () => retryCount.value++,
    selectType: (entryType?: SearchEntryType) => navigate(keyword.value, entryType),
    goToPage: (targetPage: number) => navigate(keyword.value, type.value, targetPage),
    removeRecent: (id: string) => {
      recent.value = recent.value.filter((item) => item.id !== id)
    },
    clearRecent: () => {
      recent.value = []
    }
  }
}
