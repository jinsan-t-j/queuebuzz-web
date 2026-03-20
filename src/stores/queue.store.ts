import { defineStore } from 'pinia'
import type { QueueEntry, QueueRecord } from '@/modules/app/queue/types'
import {
  addQueueEntry,
  AddQueueEntryPayload,
  callNext,
  getLiveQueue,
  getLiveQueueById,
  pauseQueue,
  resumeQueue,
  terminateQueue,
} from '@/modules/app/queue/actions/queue.action'

export const useQueueStore = defineStore('queue', {
  state: () => ({
    activeQueue: null as QueueRecord | null,
    entries: [] as QueueEntry[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    isPaused: (state) => state.activeQueue?.status === 'paused',
    waitingCount: (state) =>
      state.entries.filter((e) => e.status === 'waiting').length,
    avgWaitTime: (state) => state.activeQueue?.avgServiceMins,
    totalCount: (state) => state.entries.length,
    hasError: (state) => !!state.error,
    canJoinWithParty: (state) => state.activeQueue?.allowPartyJoining ?? false,
    maxAllowedPartySize: (state) => state.activeQueue?.maxPartySize ?? 1,
  },

  actions: {
    setActiveQueue(queue: QueueRecord) {
      this.activeQueue = queue
    },

    async fetchActiveQueue() {
      this.isLoading = true
      this.error = null
      try {
        this.activeQueue = await getLiveQueue()
      } catch (e: any) {
        if (e?.response?.status === 404) {
          this.activeQueue = null
        } else {
          this.error = e?.response?.data?.message || 'Failed to fetch active queue'
        }
      } finally {
        this.isLoading = false
      }
    },

    async fetchQueueById(id: string) {
      this.isLoading = true
      this.error = null
      try {
        this.activeQueue = await getLiveQueueById(id)
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to fetch queue'
      } finally {
        this.isLoading = false
      }
    },

    async fetchEntries() {
      if (!this.activeQueue) return

      this.isLoading = true
      this.error = null
      try {
        // this.entries = await getLiveQueueEntries(this.activeQueue.id)
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to fetch queue entries'
      } finally {
        this.isLoading = false
      }
    },

    updateEntries(newEntries: QueueEntry[]) {
      this.entries = newEntries
    },

    async pause() {
      if (!this.activeQueue) return

      this.error = null
      try {
        await pauseQueue(this.activeQueue.id)
        this.activeQueue.status = 'paused'
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to pause queue'
      }
    },

    async resume() {
      if (!this.activeQueue) return

      this.error = null
      try {
        await resumeQueue(this.activeQueue.id)
        this.activeQueue.status = 'open'
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to resume queue'
      }
    },

    async terminate() {
      if (!this.activeQueue) return

      this.error = null
      try {
        await terminateQueue(this.activeQueue.id)
        this.activeQueue = null
        this.entries = []
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to terminate queue'
      }
    },

    async addQueueEntry(guest: AddQueueEntryPayload) {
      if (!this.activeQueue) return

      this.error = null
      try {
        const entry = await addQueueEntry(this.activeQueue.id, guest)
        this.updateEntries([...this.entries, entry])
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to add guest'
      } finally {
        this.isLoading = false
      }
    },

    async callNext() {
      if (!this.activeQueue) return

      this.error = null
      try {
        await callNext(this.activeQueue.id)
        await this.fetchEntries()
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to call next guest'
      }
    },

    clearQueue() {
      this.activeQueue = null
      this.entries = []
      this.error = null
    },

    clearError() {
      this.error = null
    },
  },
})
