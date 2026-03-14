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
