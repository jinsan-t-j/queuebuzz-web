/**
 * @store queueStore
 * @description Active live queue state shared by sidebar + dashboard simultaneously.
 * Only stores data that must be visible across multiple components at once.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { QueueEntry, QueueRecord } from '@/modules/app/queue/types'

export const useQueueStore = defineStore('queue', () => {
  // State
  const activeQueue = ref<QueueRecord | null>(null)
  const entries = ref<QueueEntry[]>([])

  // Getters
  const hasActiveQueue = computed(() => !!activeQueue.value)
  const waitingCount = computed(() =>
    entries.value.filter((e) => e.status === 'waiting').length,
  )
  const totalCount = computed(() => entries.value.length)

  // Actions
  /**
   * @description Sets the active queue data.
   * @param {Object} queueData - The queue configuration object.
   */
  function setActiveQueue(queueData: QueueRecord | null) {
    activeQueue.value = queueData
  }

  /**
   * @description Updates the entries list for the active queue.
   * @param {Array} newEntries - Array of queue entry objects.
   */
  function setEntries(newEntries: QueueEntry[]) {
    entries.value = newEntries
  }

  /**
   * @description Clears the active queue and all entries.
   */
  function clearQueue() {
    activeQueue.value = null
    entries.value = []
  }

  return {
    activeQueue,
    entries,
    hasActiveQueue,
    waitingCount,
    totalCount,
    setActiveQueue,
    setEntries,
    clearQueue,
  }
})
