import type { QueueEntryStatus, QueueStatus } from './constants'
export interface QueueConfig {
  name: string
}

export interface QueueRecord {
  id: string
  name: string
  joinCode: string
  slug: string
  avgServiceMins: number
  status: QueueStatus
  allowPartyJoining: boolean
  maxPartySize: number
  strictQueueMode: boolean
  recoveryEmail?: string
  createdAt?: string
  expiresAt?: string
  entries?: QueueEntry[] // Added for hydration
}

export interface QueueEntry {
  id: string
  ticketNo: number
  position?: number
  name: string
  email?: string
  phone?: string
  partySize: number
  status: QueueEntryStatus
  servedAt?: string
  finishedAt?: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

export interface LiveQueueGuestInput {
  name: string
  phone?: string
  partySize: number
}

// Actions Payloads (Re-imported into store from here)
export interface AddQueueEntryPayload {
  name: string
  phone?: string
  email?: string
  partySize?: number
}

export interface UpdateQueuePayload {
  name?: string
  avgServiceMins?: number
  slug?: string
  recoveryEmail?: string
  strictQueueMode?: boolean
}

export type TrendDirection = 'up' | 'down' | 'flat'

export interface TrendSummary {
  text: string
  direction: TrendDirection
}

export interface QueueStatusEventData {
  id: string
  status: QueueEntryStatus
}

export interface QueueStatusData {
  status: QueueStatus
}

export interface QueueSseEnvelopeMap {
  queue_update: {
    data: QueueEntry[]
  }
  joined: {
    data: QueueEntry
  }
  called: {
    data: QueueStatusEventData
  }
  user_status_changed: {
    data: QueueStatusEventData
  }
  user_arrived: {
    data: {
      id: string
      name: string
      ticketNumber: string
    }
  }
  queue_status_changed: {
    data: QueueStatusData
  }
  queue_init: {
    data: QueueRecord
  }
  waiting_count_updated: {
    data: {
      count: number
    }
  }
}
