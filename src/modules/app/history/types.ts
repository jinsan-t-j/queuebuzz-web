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
  summary: {
    totalSessions: number
    totalServed: number
    avgSessionLength: string
  }
}

export interface SessionStats {
  totalBookings: number
  totalServed: number
  totalSkipped: number
  avgWaitTime: string
  peakVolume: string
}

export interface TimelineSubEvent {
  ticketNo: string
  name: string
  action: string
  time: string
}

export interface TimelineEvent {
  type: string
  timestamp: string
  message: string
  color: string
  subEvents?: TimelineSubEvent[]
}

export interface HistoryEntry {
  ticketNo: string
  displayName: string
  status: string
  waitTimeMin: number
  servedAt?: string
}

export interface HistoryDetail {
  queueName: string
  date: string
  status: string
  notes: string
  closedAt?: string
  stats: SessionStats
  insights: string[]
  timeline: TimelineEvent[]
  entries: HistoryEntry[]
}
