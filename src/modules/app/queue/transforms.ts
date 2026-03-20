import type {
  QueueEntry,
  QueueRecord,
} from '@/modules/app/queue/types'

function formatWaitTime(timestamp?: string | null): string {
  if (!timestamp) {
    return '0m'
  }

  const joinedAt = new Date(timestamp)
  const diffMs = Date.now() - joinedAt.getTime()
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000))
  return `${diffMinutes}m`
}

export function normalizeQueueEntry(entry: QueueEntry): QueueEntry {
  return {
    id: entry.id,
    ticketNo: entry.ticketNo,
    position: entry.position,
    name: entry.name || 'Guest',
    partySize: entry.partySize ?? 1,
    estimatedWaitMin: entry.estimatedWaitMin,
    status: entry.status.toUpperCase() as any,
    joinedAt: entry.joinedAt,
    servedAt: entry.servedAt,
    finishedAt: entry.finishedAt,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }
}

export function normalizeLiveQueueEntries(entries: QueueEntry[]): QueueEntry[] {
  return [...entries]
    .sort((left, right) => left.position - right.position)
    .map(normalizeQueueEntry)
}