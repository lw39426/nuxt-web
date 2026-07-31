import type { ApiResponse } from '~/types/api'

interface HistoryEntry {
  id: string
  type: 'product' | 'article'
  title: string
  image: string
  meta: string
  viewedAt: string
}

export default defineEventHandler(() => {
  const mockData: HistoryEntry[] = [
    {
      id: '1',
      type: 'product',
      title: 'OPPO Reno 12 Pro',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200',
      meta: '手机 · ¥3999',
      viewedAt: '2026-07-27 11:00:00'
    },
    {
      id: '2',
      type: 'article',
      title: '2026年最值得购买的智能手机推荐',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200',
      meta: '科技 · 5分钟阅读',
      viewedAt: '2026-07-27 09:30:00'
    },
    {
      id: '3',
      type: 'product',
      title: 'MacBook Pro 14英寸',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
      meta: '电脑 · ¥14999',
      viewedAt: '2026-07-26 20:15:00'
    }
  ]

  return {
    code: 200,
    message: 'success',
    data: mockData
  } satisfies ApiResponse<HistoryEntry[]>
})
