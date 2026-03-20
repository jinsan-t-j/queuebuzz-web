export interface QueueConfig {
  name: string
}

export type QueueStatus = 'active' | 'paused' | 'closed' | 'expired'

export interface QueueRecord {
  id: string
  name: string
  joinCode: string
  slug: string
  avgServiceMins: number
  status: QueueStatus
  createdAt: string
  allowPartyJoining: boolean
  maxPartySize: number
  expiresAt?: string
}

export interface ApiSuccessResponse<T> {
  message?: string
  data: T
}

export type QueueEntryStatus = 'waiting' | 'called' | 'served' | 'skipped'

export interface QueueEntry {
  id: string
  name: string
  ticketNo: number
  status: QueueEntryStatus
  estimatedWaitMin: number
  partySize: number
}

export type LiveGuestStatus = 'waiting' | 'called' | 'served' | 'skipped'

export interface LiveQueueEntry {
  id: number | string
  token: string
  ticketNo?: string
  position: number
  name: string
  partySize: number
  waitTime: string
  status: LiveGuestStatus
}

export interface LiveQueueGuestInput {
  name: string
  phone?: string
  partySize: number
}

export type TrendDirection = 'up' | 'down' | 'flat'

export interface TrendSummary {
  text: string
  direction: TrendDirection
}

export interface QueueSnapshotEntry {
  id: string
  token: string
  ticketNo: string
  position: number
  status: QueueEntryStatus
  name?: string
  partySize?: number | null
  createdBy?: string | null
  joinedAt?: string
  servedAt?: string | null
  finishedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface QueueStatusEventData {
  token: string
  status: QueueEntryStatus
}

export interface QueueExpiredEventData {
  queueId: string
}

export interface QueueStatusData {
  status: QueueStatus
}

export interface QueueSseEnvelopeMap {
  queue_update: {
    event: 'queue_update'
    data: QueueSnapshotEntry[]
  }
  user_joined: {
    event: 'user_joined'
    data: QueueSnapshotEntry
  }
  user_called: {
    event: 'user_called'
    data: QueueStatusEventData
  }
  user_status_changed: {
    event: 'user_status_changed'
    data: QueueStatusEventData
  }
  queue_status_changed: {
    event: 'queue_status_changed'
    data: QueueStatusData
  }
  queue_expired: {
    event: 'queue_expired'
    data: QueueExpiredEventData
  }
}

export interface LiveQueueResponse extends QueueRecord {
  entries: QueueSnapshotEntry[]
}
