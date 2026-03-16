export interface QueueConfig {
  name: string
}

export interface QueueRecord {
  name: string
  joinCode: string
  slug: string
  avgServiceMins: number
  status: string
  createdAt: string
}

export type QueueEntryStatus = 'waiting' | 'called' | 'served' | 'skipped'

export interface QueueEntry {
  id: string
  displayName: string
  ticketNumber: number
  status: QueueEntryStatus
  joinedAt: string
}

export type LiveGuestStatus = 'waiting' | 'called'

export interface LiveQueueEntry {
  id: number | string
  position: number
  name: string
  partySize: number
  waitTime: string
  status: LiveGuestStatus
}

export interface LiveQueueGuestInput {
  name: string
}

export type TrendDirection = 'up' | 'down' | 'flat'

export interface TrendSummary {
  text: string
  direction: TrendDirection
}
