import type { EventBatchRequest, EventPayload } from '../types'
import type { NetworkAdapter } from '../adapters/types'
import { uuidV4 } from '../utils/uuid'
import { nowMs } from '../utils/time'

interface QueueItem {
  payload: EventPayload
}

export interface EventQueueOptions {
  endpoint: string
  network: NetworkAdapter
  flushIntervalMs: number
  batchSize: number
  maxQueueSize: number
  now?: () => number
  onBeforeSend?: (batch: EventBatchRequest) => EventBatchRequest
  onDropped?: (payload: EventPayload, reason: string) => void
  debug?: boolean
}

export class EventQueue {
  private readonly endpoint: string
  private readonly network: NetworkAdapter
  private readonly flushIntervalMs: number
  private readonly batchSize: number
  private readonly maxQueueSize: number
  private readonly now: () => number
  private readonly onBeforeSend?: (batch: EventBatchRequest) => EventBatchRequest
  private readonly onDropped?: (payload: EventPayload, reason: string) => void
  private readonly debug: boolean

  private queue: QueueItem[] = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private inFlight = false
  private backoffMs = 0
  private backoffUntil = 0

  constructor(options: EventQueueOptions) {
    this.endpoint = options.endpoint
    this.network = options.network
    this.flushIntervalMs = options.flushIntervalMs
    this.batchSize = options.batchSize
    this.maxQueueSize = options.maxQueueSize
    this.now = options.now ?? nowMs
    this.onBeforeSend = options.onBeforeSend
    this.onDropped = options.onDropped
    this.debug = options.debug ?? false
  }

  enqueue(payload: EventPayload): { enqueued: boolean; dropped?: boolean; reason?: string } {
    if (!this.endpoint) {
      return { enqueued: false, dropped: true, reason: 'missing_endpoint' }
    }

    if (this.queue.length >= this.maxQueueSize) {
      const dropped = this.queue.shift()
      if (dropped) this.onDropped?.(dropped.payload, 'queue_overflow')
    }

    this.queue.push({ payload })
    this.ensureTimer()
    if (this.queue.length >= this.batchSize) {
      const schedule =
        typeof queueMicrotask === 'function'
          ? queueMicrotask
          : (fn: () => void) => setTimeout(fn, 0)
      schedule(() => {
        void this.flush({ reason: 'batch_full' })
      })
    }
    return { enqueued: true }
  }

  private ensureTimer() {
    if (this.timer) return
    this.timer = setTimeout(() => {
      this.timer = null
      void this.flush({ reason: 'interval' })
    }, this.flushIntervalMs)
  }

  async flush(options?: { useBeacon?: boolean; keepalive?: boolean; reason?: string }) {
    if (this.inFlight) return
    if (!this.endpoint) return
    if (this.queue.length === 0) return

    const currentTime = this.now()
    if (currentTime < this.backoffUntil) {
      this.ensureTimer()
      return
    }

    this.inFlight = true
    try {
      while (this.queue.length > 0) {
        const events = this.queue.splice(0, this.batchSize).map((x) => x.payload)
        const batch: EventBatchRequest = {
          batch_id: uuidV4(),
          sent_at: currentTime,
          events
        }
        const outgoing = this.onBeforeSend ? this.onBeforeSend(batch) : batch
        const result = await this.network.send(this.endpoint, outgoing, {
          keepalive: options?.keepalive,
          useBeacon: options?.useBeacon
        })

        if (!result.ok) {
          const retryable = result.retryable ?? (result.status ? result.status >= 500 : true)
          if (retryable) {
            // Put events back to the front.
            this.queue = events.map((payload) => ({ payload })).concat(this.queue)
            this.backoffMs = this.backoffMs ? Math.min(this.backoffMs * 2, 30000) : 1000
            this.backoffUntil = this.now() + this.backoffMs
            if (this.debug) {
              console.warn(
                '[tracker] flush failed, backoff(ms)=',
                this.backoffMs,
                'status=',
                result.status
              )
            }
            break
          }

          // Non-retryable: drop and continue draining to avoid infinite loops.
          for (const e of events) this.onDropped?.(e, 'non_retryable')
          continue
        }

        this.backoffMs = 0
        this.backoffUntil = 0

        // Yield if a lot of events are queued.
        if (this.queue.length >= this.batchSize * 5) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0))
        }
      }
    } finally {
      this.inFlight = false
      if (this.queue.length > 0) this.ensureTimer()
    }
  }

  destroy() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.queue = []
  }
}
