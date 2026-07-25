import type { NetworkAdapter, NetworkSendOptions, NetworkSendResult, StorageAdapter } from './types'
import { safeJsonStringify } from '../utils/safe'

class MemoryStorageAdapter implements StorageAdapter {
  private readonly store = new Map<string, string>()

  async getItem(key: string): Promise<string | null> {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value)
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key)
  }
}

class BrowserStorageAdapter implements StorageAdapter {
  private readonly storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.getItem(key)
    } catch {
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.setItem(key, value)
    } catch {
      // ignore
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.storage.removeItem(key)
    } catch {
      // ignore
    }
  }
}

export function createBrowserStorageAdapters(): { local: StorageAdapter; session: StorageAdapter } {
  // Some browsers / privacy modes may throw on storage access.
  const memoryLocal = new MemoryStorageAdapter()
  const memorySession = new MemoryStorageAdapter()

  return {
    local: (() => {
      try {
        return new BrowserStorageAdapter(window.localStorage)
      } catch {
        return memoryLocal
      }
    })(),
    session: (() => {
      try {
        return new BrowserStorageAdapter(window.sessionStorage)
      } catch {
        return memorySession
      }
    })()
  }
}

export interface BrowserNetworkAdapterOptions {
  credentials?: RequestCredentials
  headers?: Record<string, string>
}

export class BrowserNetworkAdapter implements NetworkAdapter {
  private readonly credentials: RequestCredentials
  private readonly headers: Record<string, string>

  constructor(options?: BrowserNetworkAdapterOptions) {
    this.credentials = options?.credentials ?? 'omit'
    this.headers = options?.headers ?? {}
  }

  async send(url: string, body: unknown, options?: NetworkSendOptions): Promise<NetworkSendResult> {
    const json = safeJsonStringify(body)
    const useBeacon = options?.useBeacon ?? true
    const keepalive = options?.keepalive ?? true

    // 1) sendBeacon first (best-effort, especially on page close)
    if (
      useBeacon &&
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function'
    ) {
      try {
        const blob = new Blob([json], { type: 'application/json' })
        const ok = navigator.sendBeacon(url, blob)
        if (ok) return { ok: true }
      } catch {
        // fall through to fetch
      }
    }

    // 2) fetch with keepalive fallback
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: json,
        keepalive,
        credentials: this.credentials,
        headers: {
          'content-type': 'application/json',
          ...this.headers
        }
      })

      return {
        ok: res.ok,
        status: res.status,
        retryable: res.status >= 500 || res.status === 429
      }
    } catch {
      return { ok: false, retryable: true }
    }
  }
}
