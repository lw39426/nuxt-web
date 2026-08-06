// tests/unit/sdk/queue.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventQueue } from '@sdk/tracker/internal/queue'
import type { EventPayload } from '@sdk/tracker/types'
import type { NetworkAdapter } from '@sdk/tracker/adapters/types'

function makePayload(overrides: Partial<EventPayload> = {}): EventPayload {
  return {
    app_id: 'test',
    device_id: 'd1',
    session_id: 's1',
    event_id: 'e1',
    event_type: 'custom',
    timestamp: 1000,
    ...overrides
  }
}

describe('EventQueue', () => {
  let send: NetworkAdapter['send']
  let queue: EventQueue
  let now: number

  beforeEach(() => {
    now = 1_000_000
    send = vi.fn(async () => ({ ok: true }))
    queue = new EventQueue({
      endpoint: 'https://t.example/x',
      network: { send },
      flushIntervalMs: 3000,
      batchSize: 2,
      maxQueueSize: 5,
      now: () => now,
      debug: false
    })
  })

  it('入队返回 enqueued', () => {
    const result = queue.enqueue(makePayload())
    expect(result.enqueued).toBe(true)
    expect(result.dropped).toBeFalsy()
  })

  it('缺少 endpoint 时入队直接丢弃', () => {
    const q = new EventQueue({
      endpoint: '',
      network: { send },
      flushIntervalMs: 3000,
      batchSize: 2,
      maxQueueSize: 5
    })
    const result = q.enqueue(makePayload())
    expect(result).toEqual({ enqueued: false, dropped: true, reason: 'missing_endpoint' })
  })

  it('队列超 maxQueueSize 时丢弃最老的事件（FIFO 溢出）', () => {
    const dropped = vi.fn()
    const q = new EventQueue({
      endpoint: 'https://t.example/x',
      network: { send },
      flushIntervalMs: 3000,
      batchSize: 10, // 设大避免触发自动 flush
      maxQueueSize: 3,
      onDropped: dropped
    })
    for (let i = 0; i < 5; i++) q.enqueue(makePayload({ event_id: `e${i}` }))
    expect(dropped).toHaveBeenCalledTimes(2)
    expect(dropped).toHaveBeenCalledWith(
      expect.objectContaining({ event_id: 'e0' }),
      'queue_overflow'
    )
    expect(dropped).toHaveBeenCalledWith(
      expect.objectContaining({ event_id: 'e1' }),
      'queue_overflow'
    )
  })

  it('达到 batchSize 触发一次 flush 并调 network.send', async () => {
    queue.enqueue(makePayload({ event_id: 'a' }))
    queue.enqueue(makePayload({ event_id: 'b' })) // 命中 batchSize=2
    await new Promise((r) => setTimeout(r, 0))
    expect(send).toHaveBeenCalledTimes(1)
    // 校验发送体结构
    const [url, body] = send.mock.calls[0]!
    expect(url).toBe('https://t.example/x')
    expect((body as any).events).toHaveLength(2)
    expect((body as any).batch_id).toBeTruthy()
  })

  it('inFlight 期间 flush 是空操作（不会并发发请求）', async () => {
    let resolveFirst: (r: any) => void = () => {}
    send.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve
        })
    )
    // 后续调用立即成功（让第一次 flush 最终能退出 while 循环）
    send.mockResolvedValue({ ok: true })

    queue.enqueue(makePayload({ event_id: 'a' }))
    queue.enqueue(makePayload({ event_id: 'b' })) // 命中 batchSize → 异步触发第一次 flush

    // 等 microtask 让第一次 flush 进入 await network.send 挂起
    await new Promise((r) => setTimeout(r, 0))
    expect(send).toHaveBeenCalledTimes(1)

    // 此时 inFlight=true，再调一次 flush 应立即返回（空操作），不会产生第二次 send
    await queue.flush({ reason: 'manual' })
    expect(send).toHaveBeenCalledTimes(1)

    // 解开第一次请求，让 flush 正常退出
    resolveFirst({ ok: true })
  })

  it('服务端 5xx 触发退避重试，并把事件放回队列头部', async () => {
    send
      .mockResolvedValueOnce({ ok: false, status: 500, retryable: true })
      .mockResolvedValueOnce({ ok: true })

    queue.enqueue(makePayload({ event_id: 'retry-me' }))
    queue.enqueue(makePayload({ event_id: 'b' })) // 触发第一次 flush（失败）
    await new Promise((r) => setTimeout(r, 0))

    // 推进时间越过退避窗口
    now += 2000
    await queue.flush({ reason: 'manual' })

    expect(send).toHaveBeenCalledTimes(2)
  })

  it('不可重试错误直接丢弃，不阻塞后续事件', async () => {
    const dropped = vi.fn()
    const q = new EventQueue({
      endpoint: 'https://t.example/x',
      network: { send },
      flushIntervalMs: 3000,
      batchSize: 2,
      maxQueueSize: 10,
      onDropped: dropped
    })
    send.mockResolvedValueOnce({ ok: false, status: 400, retryable: false })
    q.enqueue(makePayload({ event_id: 'bad' }))
    q.enqueue(makePayload({ event_id: 'ok' }))
    await new Promise((r) => setTimeout(r, 0))

    expect(dropped).toHaveBeenCalledWith(
      expect.objectContaining({ event_id: 'bad' }),
      'non_retryable'
    )
  })

  it('destroy 清空队列并不再发请求', async () => {
    queue.enqueue(makePayload())
    queue.destroy()
    await new Promise((r) => setTimeout(r, 0))
    expect(send).not.toHaveBeenCalled()
  })
})
