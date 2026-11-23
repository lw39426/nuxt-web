export interface ChatIdentity {
  id: number
  type: string
}

export interface ChatParticipant {
  id?: number | null
  type?: string | null
  name?: string | null
  avatar?: string | null
  is_online?: boolean | null
  online_status?: string | null
  last_seen_at?: string | null
}

export interface ChatMessage {
  id: number
  room_id?: number
  content?: string | null
  created_at?: string | null
  sender?: ChatParticipant | null
  is_own?: boolean | null
}

export interface ChatRoom {
  id: number
  type?: string | null
  name?: string | null
  participants?: ChatParticipant[] | null
  participant_count?: number | null
  unread_count?: number | null
  last_message?: Omit<ChatMessage, 'is_own'> | null
}

export interface ChatPage<T> {
  rooms?: T[]
  messages?: T[]
  pagination?: { has_next?: boolean | null } | null
}

export interface ChatConnectedEvent {
  user_id?: number | null
  user_type?: string | null
}
