export type EventType = 'page_view' | 'error' | 'custom' | 'expose' | 'click'

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

export type EventParams = Record<string, JsonValue>

export interface EventPayload<TParams extends EventParams = EventParams> {
  app_id: string
  device_id: string
  session_id: string
  event_id: string
  event_type: EventType
  timestamp: number

  event_name?: string
  user_id?: string | null

  url?: string
  referrer?: string
  prev_url?: string

  env?: string
  platform?: string
  sdk_version?: string

  params?: TParams
}

export interface EventBatchRequest {
  batch_id: string
  sent_at: number
  events: EventPayload[]
}

export interface TrackResult {
  enqueued: boolean
  dropped?: boolean
  reason?: string
}
