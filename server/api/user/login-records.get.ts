import type { ApiResponse } from '~/types/api'

interface LoginRecord {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  current: boolean
  loginAt: string
}

export default defineEventHandler(() => {
  const mockData: LoginRecord[] = [
    {
      id: '1',
      device: 'Windows',
      browser: 'Chrome 120',
      location: '中国 广东省',
      ip: '192.168.1.***',
      current: true,
      loginAt: '2026-07-27 10:30:00'
    },
    {
      id: '2',
      device: 'iPhone',
      browser: 'Safari',
      location: '中国 广东省',
      ip: '192.168.1.***',
      current: false,
      loginAt: '2026-07-26 18:20:00'
    }
  ]

  return {
    code: 200,
    message: 'success',
    data: mockData
  } satisfies ApiResponse<LoginRecord[]>
})
