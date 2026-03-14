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
   * @description Creates a new queue with mock data.
   * @param {Object} config - Queue configuration
   * @param {string} config.name - Queue name
   * @returns {Object} The created queue object
   */
  function createQueue(config: Partial<QueueConfig> = {}): QueueRecord {
    const queue: QueueRecord = {
      id: `q_${Date.now()}`,
      name: config.name || "Today's Queue",
      joinCode: generateJoinCode(),
      hostSlug: 'rivera-barbershop',
      createdAt: new Date().toISOString(),
      isOpen: true,
    }
    store.setActiveQueue(queue)
    store.setEntries([])
    return queue
  }

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
    createQueue,
    addEntry,
    callEntry,
    closeQueue,
  }
}

/**
 * @description Generates a random 6-character alphanumeric join code.
 * @returns {string} Join code like "8X4K2F"
 */
function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
