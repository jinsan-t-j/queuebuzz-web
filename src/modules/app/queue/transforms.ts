import type {
  LiveQueueEntry,
  LiveQueueResponse,
  QueueRecord,
  QueueSnapshotEntry,
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

export function normalizeLiveQueueEntry(entry: QueueSnapshotEntry): LiveQueueEntry {
  return {
    id: entry.id || entry.token,
    token: entry.token,
    ticketNo: entry.ticketNo,
    position: entry.position,
    name: entry.name || 'Guest',
    partySize: entry.partySize ?? 1,
    waitTime: formatWaitTime(entry.joinedAt || entry.createdAt),
    status: entry.status,
  }
}

export function normalizeLiveQueueEntries(entries: QueueSnapshotEntry[]): LiveQueueEntry[] {
  return [...entries]
    .sort((left, right) => left.position - right.position)
    .map(normalizeLiveQueueEntry)
}

export function extractQueueRecord(queue: LiveQueueResponse): QueueRecord {
  return {
    id: queue.id,
    name: queue.name,
    joinCode: queue.joinCode,
    slug: queue.slug,
    avgServiceMins: queue.avgServiceMins,
    status: queue.status,
    createdAt: queue.createdAt,
    allowPartyJoining: queue.allowPartyJoining,
    maxPartySize: queue.maxPartySize,
    expiresAt: queue.expiresAt,
  }
}
