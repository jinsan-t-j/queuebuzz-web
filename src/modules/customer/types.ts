export interface JoinQueuePayload {
  name?: string
  phone?: string
  partySize?: number
  [key: string]: unknown
}

export interface JoinQueueResult {
  ticketNumber: string
  position: number
  ahead: number
  estWaitMin: number
}

export interface GeofenceStatus {
  isWithinRange: boolean
  distanceMeters: number
}

export type CustomerTicketStatus = 'waiting' | 'idle' | 'called' | 'served'

export interface WaitingStatus {
  ticketNumber: string
  position: number
  ahead: number
  estWaitMin: number
  totalInQueue: number
  servedCount: number
  status: CustomerTicketStatus
  buzzEnabled: boolean
}

export interface MutationResult {
  success: boolean
}

export interface JoinByCodeResult {
  found: boolean
  queueName?: string
  queueId?: string
}
