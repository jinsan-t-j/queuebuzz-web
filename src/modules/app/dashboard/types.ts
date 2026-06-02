export interface SetupStep {
  label: string
  sub: string
  isDone: boolean
}

export interface QuickSetup {
  show: boolean
  steps: SetupStep[]
}

export interface DashboardData {
  activeQueue: {
    isActive: boolean
    queueName: string
    startedAt: string
    waiting: number
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
    returningCount: number
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
    day?: number
    value: number
  }>
  quickSetup: QuickSetup
  greeting: {
    name: string
  }
  hasHistory: boolean
}
