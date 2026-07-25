import { uuidV4 } from '../utils/uuid'
import { nowMs } from '../utils/time'
import type { StorageAdapter } from '../adapters/types'
import { safeJsonParse, safeJsonStringify } from '../utils/safe'

export interface SessionState {
  sessionId: string
  lastActivityAt: number
}

export interface SessionManagerOptions {
  sessionKey: string
  idleTimeoutMs: number
  storage: StorageAdapter
  now?: () => number
}

export class SessionManager {
  private readonly sessionKey: string
  private readonly idleTimeoutMs: number
  private readonly storage: StorageAdapter
  private readonly now: () => number

  constructor(options: SessionManagerOptions) {
    this.sessionKey = options.sessionKey
    this.idleTimeoutMs = options.idleTimeoutMs
    this.storage = options.storage
    this.now = options.now ?? nowMs
  }

  async getOrCreate(): Promise<SessionState> {
    const stored = safeJsonParse<SessionState>(await this.storage.getItem(this.sessionKey))
    const currentTime = this.now()

    if (stored && stored.sessionId && stored.lastActivityAt) {
      const idleMs = currentTime - stored.lastActivityAt
      if (idleMs <= this.idleTimeoutMs) return stored
    }

    const fresh: SessionState = { sessionId: uuidV4(), lastActivityAt: currentTime }
    await this.storage.setItem(this.sessionKey, safeJsonStringify(fresh))
    return fresh
  }

  async touch(existing?: SessionState): Promise<SessionState> {
    const current = existing ?? (await this.getOrCreate())
    const updated: SessionState = { sessionId: current.sessionId, lastActivityAt: this.now() }
    await this.storage.setItem(this.sessionKey, safeJsonStringify(updated))
    return updated
  }

  async reset(): Promise<SessionState> {
    const fresh: SessionState = { sessionId: uuidV4(), lastActivityAt: this.now() }
    await this.storage.setItem(this.sessionKey, safeJsonStringify(fresh))
    return fresh
  }
}
