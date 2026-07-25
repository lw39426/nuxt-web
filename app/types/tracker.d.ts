type TrackParams = Record<string, any>

interface TrackResult {
  enqueued: boolean
  dropped?: boolean
  reason?: string
}

declare module '#app' {
  interface NuxtApp {
    $track: (eventName: string, params?: TrackParams) => TrackResult
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $track: (eventName: string, params?: TrackParams) => TrackResult
  }
}

export {}
