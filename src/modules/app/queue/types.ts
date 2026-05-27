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
  manualPositioning: boolean
  strictQueueMode: boolean
  collectEmails: boolean
  isGeoLocked?: boolean
  latitude?: number
  longitude?: number
  geoRadiusMeters?: number
  hostProfileImageUrl?: string
  hostBannerImageUrl?: string
  createdAt?: string
  expiresAt?: string
  updatedAt?: string
  notes?: string
  entries?: QueueEntry[]
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
  strictQueueMode?: boolean
  notes?: string
  isGeoLocked?: boolean
  latitude?: number
  longitude?: number
  geoRadiusMeters?: number
  allowPartyJoining?: boolean
  maxPartySize?: number
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
  user_updated: {
    data: QueueEntry
  }
  waiting_count_updated: {
    data: {
      count: number
      avgServiceMins?: number
    }
  }
}
