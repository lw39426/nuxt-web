import type { Banner } from '../../../app/composables/api/home'

export default defineEventHandler((event) =>
  withMockOrProxy(event, '/banners', () => {
    const { placement_key } = getQuery(event)
    const date = '2026-10-24T00:00:00Z'
    const banners: Banner[] =
      placement_key === 'blog_top_banner'
        ? ['/hero02-desktop-v1.webp', '/hero02-mobile.webp'].map((image_url, index) => ({
            id: index + 1,
            image_url,
            title: index === 0 ? '角色专题' : '世界观解析',
            description: null,
            link_type: 'article',
            link_target: `/blog/mock-blog-${100 + index}`,
            placement_key,
            client_type: 'web',
            sort_order: index,
            status: true,
            start_time: null,
            end_time: null,
            created_at: date,
            updated_at: date
          }))
        : []

    return { banners, source: 'mock', cache_key: '', cached: false }
  })
)
