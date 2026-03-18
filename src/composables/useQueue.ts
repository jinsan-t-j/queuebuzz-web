import { useQueueStore } from '@/stores/queue.store'
import { computed } from 'vue'
import type { QueueEntry } from '@/modules/app/queue/types'

export function useQueue() {
  const store = useQueueStore()

  const activeQueue = computed(() => store.activeQueue)
  const entries = computed(() => store.entries)
  const waitingCount = computed(() => store.waitingCount)

  function addEntry(displayName: string): QueueEntry {
    const entry: QueueEntry = {
      id: `e_${Date.now()}`,
      displayName,
      ticketNumber: store.entries.length + 1,
      status: 'waiting',
      joinedAt: new Date().toISOString(),
    }
    store.updateEntries([...store.entries, entry])
    return entry
  }

  function callEntry(entryId: string) {
    const updated = store.entries.map((entry) =>
      entry.id === entryId ? { ...entry, status: 'called' as const } : entry,
    )
    store.updateEntries(updated)
  }

  function closeQueue() {
    store.clearQueue()
  }

  return {
    activeQueue,
    entries,
    waitingCount,
    addEntry,
    callEntry,
    closeQueue,
  }
}
