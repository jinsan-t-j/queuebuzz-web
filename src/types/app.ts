export type ToastType = 'success' | 'error'

export interface ToastOptions {
  type?: ToastType
  duration?: number
}

export type UserTier = 'free' | 'premium'

export interface AuthUser {
  id: string
  name: string
  email: string
  businessName: string
  tier: UserTier
  avatar: string | null
}

export interface QueueConfig {
  name: string
}

export interface QueueRecord {
  id: string
  name: string
  joinCode: string
  hostSlug: string
  createdAt: string
  isOpen: boolean
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

export interface QueueHistoryItem {
  id: number
  date: string
  name: string
  totalServed: number
  avgWait: string
  status: 'Completed' | 'Active' | 'Terminated' | 'Paused'
  dateFormatted?: string
}

export interface HistoryQueryParams {
  search?: string
  filter?: string
  sortDirection?: 'asc' | 'desc'
  limit?: number
  page?: number
}

export interface HistoryQueryResult {
  data: QueueHistoryItem[]
  totalCount: number
  totalPages: number
}

export interface DashboardData {
  activeQueue: {
    isActive: boolean
    queueName: string
    startedAt: string
  }
  stats: {
    servedToday: number
    avgWait: string
    peakWait: number
    skipped: number
  }
  weekChart: Array<{
    day: string
    value: number
    isFuture: boolean
    isToday: boolean
  }>
  recentSessions: Array<{
    id: string
    name: string
    date: string
    duration: string
    served: number
  }>
  returnRate: {
    hasData: boolean
    chartData: Array<{
      day: string
      rate: number
    }>
    byQueue: Array<{
      label: string
      rate: number
    }>
  }
  droppedSkipped: Array<{
    hour: number
    day: number
    value: number
  }>
  peakHours: Array<{
    hour: string
    value: number
  }>
  quickSetup: {
    show: boolean
    steps: Array<{
      label: string
      sub: string
      isDone: boolean
    }>
  }
  greeting: {
    name: string
  }
}

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

export interface HistoryDetail {
  queueName: string
  date: string
  timeRange: string
  status: string
  stats: {
    served: number
    avgWait: string
    peakConcurrent: number
    droppedNoShow: number
  }
  entries: Array<{
    id: string
    ticket: string
    name: string
    joined: string
    waited: string
    status: 'served' | 'skipped'
    servedAt: string | null
  }>
  totalCount: number
  timeline: Array<{
    time: string
    label: string
    sub: string | null
    type: 'success' | 'warning' | 'danger'
  }>
}
