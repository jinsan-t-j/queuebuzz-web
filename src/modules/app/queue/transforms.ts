import type { QueueEntryStatus } from '@/modules/app/queue/constants'
import type { QueueEntry } from '@/modules/app/queue/types'

export function normalizeQueueEntry(entry: QueueEntry): QueueEntry {
  return {
    id: entry.id,
    ticketNo: entry.ticketNo,
    verifyCode: entry.verifyCode,
    position: entry.position,
    name: entry.name || 'Guest',
    email: entry.email,
    phone: entry.phone,
    partySize: entry.partySize ?? 1,
    status: entry.status.toUpperCase() as QueueEntryStatus,
    servedAt: entry.servedAt,
    finishedAt: entry.finishedAt,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    createdBy: entry.createdBy,
  }
}

export function normalizeLiveQueueEntries(entries: QueueEntry[]): QueueEntry[] {
  return [...entries].sort((left, right) => left.position - right.position).map(normalizeQueueEntry)
}
