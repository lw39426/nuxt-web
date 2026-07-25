import type { EventParams, EventPayload, EventType, TrackResult } from './types'
import type { NetworkAdapter, StorageAdapter } from './adapters/types'
import { uuidV4 } from './utils/uuid'
import { nowMs } from './utils/time'
import { safeJsonParse, safeJsonStringify } from './utils/safe'
import { EventQueue } from './internal/queue'

export interface TrackerAdapters {
  deviceStorage: StorageAdapter
  sessionStorage: StorageAdapter
  network: NetworkAdapter
}

export interface TrackerConfig {
  appId: string
  endpoint: string
  enabled?: boolean

  env?: string
  platform?: string
  sdkVersion?: string

  idleTimeoutMs?: number
  flushIntervalMs?: number
  batchSize?: number
  maxQueueSize?: number

  debug?: boolean
  sanitize?: (payload: EventPayload) => EventPayload
  enrich?: () => Partial<EventPayload>
}

interface PersistedDevice {
  deviceId: string
  createdAt: number
}

interface PersistedSession {
  sessionId: string
  lastActivityAt: number
}

export class Tracker {
  private readonly adapters: TrackerAdapters
  private readonly config: Required<
    Pick<
      TrackerConfig,
      | 'appId'
      | 'endpoint'
      | 'idleTimeoutMs'
      | 'flushIntervalMs'
      | 'batchSize'
      | 'maxQueueSize'
      | 'debug'
      | 'sdkVersion'
      | 'platform'
    >
  > &
    Pick<TrackerConfig, 'env' | 'sanitize' | 'enrich'>

  private enabled: boolean

  private readonly now: () => number
  private readonly deviceKey: string
  private readonly sessionKey: string

  private queue: EventQueue

  private deviceId: string | null = null
  private sessionId: string | null = null
  private lastActivityAt = 0
  private userId: string | null = null
  private prevUrl: string | undefined

  constructor(config: TrackerConfig, adapters: TrackerAdapters, now?: () => number) {
    this.adapters = adapters
    this.now = now ?? nowMs

    this.config = {
      appId: config.appId,
      endpoint: config.endpoint,
      idleTimeoutMs: config.idleTimeoutMs ?? 30 * 60 * 1000,
      flushIntervalMs: config.flushIntervalMs ?? 3000,
      batchSize: config.batchSize ?? 10,
      maxQueueSize: config.maxQueueSize ?? 200,
      debug: config.debug ?? false,
      sdkVersion: config.sdkVersion ?? '0.1.0',
      platform: config.platform ?? 'web',
      env: config.env ?? undefined,
      sanitize: config.sanitize,
      enrich: config.enrich
    }

    this.enabled = config.enabled ?? true

    this.deviceKey = `tracker:${this.config.appId}:device`
    this.sessionKey = `tracker:${this.config.appId}:session`

    this.queue = new EventQueue({
      endpoint: this.config.endpoint,
      network: this.adapters.network,
      flushIntervalMs: this.config.flushIntervalMs,
      batchSize: this.config.batchSize,
      maxQueueSize: this.config.maxQueueSize,
      now: this.now,
      debug: this.config.debug
    })
  }

  async init() {
    if (!this.enabled) return
    if (!this.config.endpoint) {
      if (this.config.debug) {
        console.warn('[tracker] disabled: missing endpoint')
      }
      this.enabled = false
      return
    }

    this.deviceId = await this.getOrCreateDeviceId()
    const session = await this.getOrCreateSessionState()
    this.sessionId = session.sessionId
    this.lastActivityAt = session.lastActivityAt
  }

  setUserId(userId: string | null) {
    this.userId = userId
  }

  setPrevUrl(url: string | undefined) {
    this.prevUrl = url
  }

  getDeviceId() {
    return this.deviceId
  }

  getSessionId() {
    return this.sessionId
  }

  async flush(reason?: string) {
    if (!this.enabled) return
    await this.queue.flush({ reason })
  }

  async flushOnClose() {
    if (!this.enabled) return
    await this.queue.flush({ useBeacon: true, keepalive: true, reason: 'page_close' })
  }

  trackCustom(eventName: string, params?: EventParams): TrackResult {
    return this.track('custom', { event_name: eventName, params })
  }

  track(
    type: EventType,
    partial: Partial<EventPayload> & { params?: EventParams } = {}
  ): TrackResult {
    if (!this.enabled) return { enqueued: false, dropped: true, reason: 'disabled' }
    if (!this.deviceId || !this.sessionId) {
      // init is async; fail-safe: drop silently to avoid blocking business.
      return { enqueued: false, dropped: true, reason: 'not_initialized' }
    }

    const timestamp = this.now()
    // Update session based on activity (non-blocking)
    this.refreshSessionIfNeededSync(timestamp)

    const base: EventPayload = {
      app_id: this.config.appId,
      device_id: this.deviceId,
      session_id: this.sessionId,
      event_id: uuidV4(),
      event_type: type,
      timestamp,
      user_id: this.userId,
      prev_url: this.prevUrl,
      env: this.config.env,
      platform: this.config.platform,
      sdk_version: this.config.sdkVersion
    }

    const enriched = this.config.enrich ? this.config.enrich() : {}
    const payload: EventPayload = {
      ...base,
      ...enriched,
      ...partial,
      params: partial.params ?? undefined
    }

    const finalPayload = this.config.sanitize ? this.config.sanitize(payload) : payload
    const result = this.queue.enqueue(finalPayload)

    if (type === 'error') {
      const schedule =
        typeof queueMicrotask === 'function'
          ? queueMicrotask
          : (fn: () => void) => setTimeout(fn, 0)
      schedule(() => {
        void this.queue.flush({ reason: 'error' })
      })
    }

    return result
  }

  destroy() {
    this.queue.destroy()
  }

  private refreshSessionIfNeededSync(ts: number) {
    const currentSessionId = this.sessionId ?? uuidV4()
    const idleMs = ts - this.lastActivityAt
    if (idleMs > this.config.idleTimeoutMs) {
      const newSessionId = uuidV4()
      this.sessionId = newSessionId
      this.lastActivityAt = ts
      void this.persistSessionState({
        sessionId: newSessionId,
        lastActivityAt: this.lastActivityAt
      })
      return
    }

    this.sessionId = currentSessionId
    this.lastActivityAt = ts
    void this.persistSessionState({
      sessionId: currentSessionId,
      lastActivityAt: this.lastActivityAt
    })
  }

  private async getOrCreateDeviceId(): Promise<string> {
    const stored = safeJsonParse<PersistedDevice>(
      await this.adapters.deviceStorage.getItem(this.deviceKey)
    )
    if (stored?.deviceId) return stored.deviceId

    const fresh: PersistedDevice = { deviceId: uuidV4(), createdAt: this.now() }
    await this.adapters.deviceStorage.setItem(this.deviceKey, safeJsonStringify(fresh))
    return fresh.deviceId
  }

  private async getOrCreateSessionState(): Promise<PersistedSession> {
    const stored = safeJsonParse<PersistedSession>(
      await this.adapters.sessionStorage.getItem(this.sessionKey)
    )
    const ts = this.now()

    if (stored?.sessionId && stored?.lastActivityAt) {
      const idleMs = ts - stored.lastActivityAt
      if (idleMs <= this.config.idleTimeoutMs) return stored
    }

    const fresh: PersistedSession = { sessionId: uuidV4(), lastActivityAt: ts }
    await this.adapters.sessionStorage.setItem(this.sessionKey, safeJsonStringify(fresh))
    return fresh
  }

  private async persistSessionState(state: PersistedSession) {
    await this.adapters.sessionStorage.setItem(this.sessionKey, safeJsonStringify(state))
  }
}
