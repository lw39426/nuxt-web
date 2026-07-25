export interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

export interface NetworkSendOptions {
  keepalive?: boolean
  useBeacon?: boolean
}

export interface NetworkSendResult {
  ok: boolean
  status?: number
  retryable?: boolean
}

export interface NetworkAdapter {
  send(url: string, body: unknown, options?: NetworkSendOptions): Promise<NetworkSendResult>
}
