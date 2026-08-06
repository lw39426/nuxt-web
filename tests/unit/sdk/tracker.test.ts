// tests/unit/sdk/tracker.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Tracker } from '@sdk/tracker/tracker'
import type { TrackerAdapters } from '@sdk/tracker/tracker'
import type { NetworkSendResult } from '@sdk/tracker/adapters/types'

function makeAdapters(overrides: Partial<TrackerAdapters> = {}): TrackerAdapters {
  const memory = new Map<string, string>()
  return {
    deviceStorage: {
      getItem: async (k: string) => memory.get(k) ?? null,
      setItem: async (k: string, v: string) => {
        memory.set(k, v)
      },
      removeItem: async (k: string) => {
        memory.delete(k)
      }
    },
    sessionStorage: {
      getItem: async (k: string) => memory.get(k) ?? null,
      setItem: async (k: string, v: string) => {
        memory.set(k, v)
      },
      removeItem: async (k: string) => {
        memory.delete(k)
      }
    },
    network: { send: vi.fn(async (): Promise<NetworkSendResult> => ({ ok: true })) },
    ...overrides
  }
}

describe('Tracker', () => {
  let now: number
  let adapters: TrackerAdapters

  beforeEach(() => {
    now = 1_000_000
    adapters = makeAdapters()
  })

  it('init 创建 device_id 与 session_id 并持久化', async () => {
    const t = new Tracker(
      { appId: 'test', endpoint: 'https://t.example/x', batchSize: 10 },
      adapters,
      () => now
    )
    expect(t.getDeviceId()).toBeNull()
    expect(t.getSessionId()).toBeNull()

    await t.init()

    expect(t.getDeviceId()).toBeTruthy()
    expect(t.getSessionId()).toBeTruthy()
    expect(t.getDeviceId()).toHaveLength(36) // uuid 格式
  })

  it('init 后重复调用不会生成新的 device_id（持久化复用）', async () => {
    const cfg = { appId: 'test', endpoint: 'https://t.example/x', batchSize: 10 }
    const t1 = new Tracker(cfg, adapters, () => now)
    await t1.init()
    const firstDevice = t1.getDeviceId()
    const firstSession = t1.getSessionId()

    const t2 = new Tracker(cfg, adapters, () => now)
    await t2.init()
    expect(t2.getDeviceId()).toBe(firstDevice)
    // session 在 idleTimeoutMs 内也复用
    expect(t2.getSessionId()).toBe(firstSession)
  })

  it('track 在 init 之前返回 not_initialized', () => {
    const t = new Tracker(
      { appId: 'test', endpoint: 'https://t.example/x', batchSize: 10 },
      adapters,
      () => now
    )
    const result = t.track('page_view')
    expect(result).toEqual({ enqueued: false, dropped: true, reason: 'not_initialized' })
  })

  it('track 在 init 之后入队成功', async () => {
    const t = new Tracker(
      { appId: 'test', endpoint: 'https://t.example/x', batchSize: 10 },
      adapters,
      () => now
    )
    await t.init()
    const result = t.track('page_view')
    expect(result.enqueued).toBe(true)
  })

  it('disabled=true 的 tracker 丢弃所有事件', async () => {
    const t = new Tracker(
      { appId: 'test', endpoint: 'https://t.example/x', enabled: false, batchSize: 10 },
      adapters,
      () => now
    )
    await t.init()
    const result = t.track('page_view')
    expect(result).toEqual({ enqueued: false, dropped: true, reason: 'disabled' })
  })

  it('达到 batchSize 触发 flush 调用 network.send', async () => {
    const t = new Tracker(
      { appId: 'test', endpoint: 'https://t.example/x', batchSize: 2 },
      adapters,
      () => now
    )
    await t.init()
    t.track('page_view')
    t.track('page_view') // 命中 batchSize=2
    await new Promise((r) => setTimeout(r, 0))
    expect(adapters.network.send).toHaveBeenCalledTimes(1)
  })

  it('idle 超时会轮换 session_id', async () => {
    const idleTimeoutMs = 30_000
    const t = new Tracker(
      { appId: 'test', endpoint: 'https://t.example/x', batchSize: 10, idleTimeoutMs },
      adapters,
      () => now
    )
    await t.init()
    const firstSession = t.getSessionId()

    now += idleTimeoutMs + 1 // 超过 idle 窗口
    t.track('page_view')
    expect(t.getSessionId()).not.toBe(firstSession)
  })

  it('idle 窗口内不轮换 session_id', async () => {
    const idleTimeoutMs = 30_000
    const t = new Tracker(
      { appId: 'test', endpoint: 'https://t.example/x', batchSize: 10, idleTimeoutMs },
      adapters,
      () => now
    )
    await t.init()
    const firstSession = t.getSessionId()

    now += idleTimeoutMs - 1
    t.track('page_view')
    expect(t.getSessionId()).toBe(firstSession)
  })

  it('flushOnClose 使用 useBeacon + keepalive', async () => {
    const t = new Tracker(
      { appId: 'test', endpoint: 'https://t.example/x', batchSize: 10 },
      adapters,
      () => now
    )
    await t.init()
    t.trackCustom('checkout', { amount: 99 })
    await t.flushOnClose()
    expect(adapters.network.send).toHaveBeenCalledWith(
      'https://t.example/x',
      expect.anything(),
      expect.objectContaining({ useBeacon: true, keepalive: true })
    )
  })

  it('destroy 后 track 入队不再发请求', async () => {
    const t = new Tracker(
      { appId: 'test', endpoint: 'https://t.example/x', batchSize: 10 },
      adapters,
      () => now
    )
    await t.init()
    t.destroy()
    t.track('page_view')
    await new Promise((r) => setTimeout(r, 0))
    expect(adapters.network.send).not.toHaveBeenCalled()
  })
})
