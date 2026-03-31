export const QUEUE_ERROR_REASONS = {
  SESSION_EXPIRED: 'session_expired',
  UNAUTHORIZED: 'unauthorized',
  QUEUE_NOT_FOUND: 'queue_not_found',
  QUEUE_ENDED: 'queue_ended',
  TERMINATED: 'terminated',
  UNKNOWN: 'unknown_error',
} as const

export type QueueErrorReason = typeof QUEUE_ERROR_REASONS[keyof typeof QUEUE_ERROR_REASONS]
