export interface JoinQueuePayload {
  name?: string
  phone?: string
  email?: string
  partySize?: number
  notificationEnabled: boolean
  fcmToken?: string | null
}

export interface JoinQueueResult {
  id: string
  ticketNumber: string
  position: number
  ahead: number
  estWaitMin: number
  totalInQueue: number
  servedCount: number
}

export type CustomerTicketStatus = 'waiting' | 'idle' | 'called' | 'served'

export interface WaitingStatus {
  id: string
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
