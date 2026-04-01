export const QUEUE_ERROR_REASONS = {
  SESSION_EXPIRED: 'session_expired',
  UNAUTHORIZED: 'unauthorized',
  QUEUE_NOT_FOUND: 'queue_not_found',
  QUEUE_ENDED: 'queue_ended',
  TERMINATED: 'terminated',
  UNKNOWN: 'unknown_error',
} as const

export const ENTRY_STATUS = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  SERVED: 'SERVED',
  SKIPPED: 'SKIPPED',
  IDLE: 'IDLE',
  LEFT: 'LEFT',
  ARRIVED: 'ARRIVED',
} as const

export type QueueErrorReason = typeof QUEUE_ERROR_REASONS[keyof typeof QUEUE_ERROR_REASONS]
export type QueueEntryStatus = typeof ENTRY_STATUS[keyof typeof ENTRY_STATUS]
