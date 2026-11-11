import type { SiteSearchData, SiteSearchItem } from '#shared/siteSearch'
import type { ApiResponse } from '~/types/api'
import type { Article } from '~/types/blog'
import type { Product } from '~/types/product'
import type { Character } from '~/composables/api/region'
import { formatDate } from '~/utils/format'

export interface SearchCardMedia {
  image: string
  region?: string
  tags?: (string | undefined)[]
  description?: string
  details?: (string | undefined)[]
}

export function useSiteSearchCardMedia(results: () => SiteSearchData) {
  const media = shallowRef(new Map<SiteSearchItem, SearchCardMedia>())

  watch(
    results,
    (data, _previous, onCleanup) => {
      media.value = new Map()
      const controller = new AbortController()
      onCleanup(() => controller.abort())

      const options = { signal: controller.signal, retry: 0 }
      const itemsFor = (type: SiteSearchItem['entry_type']) =>
        data.tabs.find((tab) => tab.entry_type === type)?.items ?? []

      function add(entries: [SiteSearchItem, SearchCardMedia][]) {
        if (!controller.signal.aborted && entries.length) {
          media.value = new Map([...media.value, ...entries])
        }
      }

      async function loadCards<T extends { code: string; id?: string | number }>(
        type: 'article' | 'product',
        fetchItems: () => Promise<T[]>,
        describe: (item: T) => SearchCardMedia
      ) {
        const items = itemsFor(type)
        if (!items.length) return
        const records = await fetchItems()
        add(
          items.flatMap((item): [SiteSearchItem, SearchCardMedia][] => {
            const match = records.find((record) =>
              item.code ? record.code === item.code : String(record.id) === String(item.id)
            )
            return match ? [[item, describe(match)]] : []
          })
        )
      }

      const query = { keyword: data.q, page: 1, pageSize: 50 }
      void loadCards(
        'product',
        async () => {
          const response = await $fetch<ApiResponse<{ products: Product[] }>>(
            '/api/v1/product/search',
            { ...options, query }
          )
          return response.data?.products ?? []
        },
        (product) => ({
          image: product.main_image,
          description: product.description,
          tags: [
            product.character_type,
            ...(product.tags ?? []).map((tag) => tag.name),
            product.era,
            product.category_name,
            product.brand?.name
          ],
          details: [product.brand?.name, product.category_name]
        })
      ).catch(() => {})

      void loadCards(
        'article',
        async () => {
          const response = await $fetch<ApiResponse<{ articles: Article[] }>>(
            '/api/v1/article/search',
            { ...options, query }
          )
          return response.data?.articles ?? []
        },
        (article) => ({
          image: article.image,
          description: article.description,
          tags: [article.category_name, ...(article.tags ?? []).map((tag) => tag.name)],
          details: [
            article.user?.nickname || article.author,
            article.published_date ? formatDate(article.published_date) : undefined
          ]
        })
      ).catch(() => {})

      for (const item of itemsFor('character')) {
        const code = encodeURIComponent(item.code || String(item.id))
        void $fetch<ApiResponse<Character>>(`/api/v1/characters/${code}`, options)
          .then(({ data: character }) => {
            if (!character?.region_code) return
            add([
              [
                item,
                {
                  image: character.avatar_url || character.cover_img_url,
                  region: character.region_code,
                  description: character.description || character.quote,
                  tags: [character.region_name, character.element],
                  details: [
                    typeof character.cv_cn === 'string' && character.cv_cn
                      ? `配音：${character.cv_cn}`
                      : undefined
                  ]
                }
              ]
            ])
          })
          .catch(() => {})
      }
    },
    { immediate: true }
  )

  return media
}
