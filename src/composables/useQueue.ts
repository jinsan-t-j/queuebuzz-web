/**
 * @composable useQueue
 * @description Provides queue management actions and mock data.
 * Wraps the queue store with convenience methods for creating,
 * opening, and managing queue entries.
 */
import { useQueueStore } from '@/stores/queue.store'
import { ref, computed } from 'vue'
import type { QueueConfig, QueueEntry, QueueRecord } from '@/modules/app/queue/types'

/**
 * @returns {Object} Queue composable with state and management methods.
 */
export function useQueue() {
  const store = useQueueStore()
  const isLoading = ref(false)

  const activeQueue = computed(() => store.activeQueue)
  const entries = computed(() => store.entries)
  const hasActiveQueue = computed(() => store.hasActiveQueue)
  const waitingCount = computed(() => store.waitingCount)


  /**
   * @description Adds a mock customer entry to the queue.
   * @param {string} displayName - Customer display name
   */
  function addEntry(displayName: string): QueueEntry {
    const entry: QueueEntry = {
      id: `e_${Date.now()}`,
      displayName,
      ticketNumber: store.entries.length + 1,
      status: 'waiting',
      joinedAt: new Date().toISOString(),
    }
    store.setEntries([...store.entries, entry])
    return entry
  }

  /**
   * @description Marks a queue entry as called.
   * @param {string} entryId - The entry ID to call
   */
  function callEntry(entryId: string) {
    const updated: QueueEntry[] = store.entries.map((entry) =>
      entry.id === entryId ? { ...entry, status: 'called' } : entry,
    )
    store.setEntries(updated)
  }

  /**
   * @description Closes the active queue.
   */
  function closeQueue() {
    store.clearQueue()
  }

  return {
    activeQueue,
    entries,
    hasActiveQueue,
    waitingCount,
    isLoading,
    addEntry,
    callEntry,
    closeQueue,
  }
}
