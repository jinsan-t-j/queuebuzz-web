import { defineStore } from 'pinia'
import { API_ROUTES, buildApiUrl } from '@/config/api.constants'
import { createSseClient, type SseClient, type SseConnectionState } from '@/lib/sse'
import type {
  QueueEntry,
  QueueStatus,
  QueueRecord,
  QueueSseEnvelopeMap,
  QueueStatusEventData,
} from '@/modules/app/queue/types'
import {
  addQueueEntry,
  AddQueueEntryPayload,
  callGuest,
  callNext,
  getLiveQueue,
  getLiveQueueById,
  pauseQueue,
  resumeQueue,
  serveGuest,
  terminateQueue,
} from '@/modules/app/queue/actions/queue.action'
import {
  normalizeLiveQueueEntries,
  normalizeQueueEntry,
} from '@/modules/app/queue/transforms'

let queueEventsClient: SseClient | null = null
let connectedQueueId: string | null = null

export const useQueueStore = defineStore('queue', {
  state: () => ({
    activeQueue: null as QueueRecord | null,
    entries: [] as QueueEntry[],
    isLoading: false,
    error: null as string | null,
    streamState: 'idle' as SseConnectionState,
  }),

  getters: {
    isPaused: (state) => state.activeQueue?.status === 'paused',
    waitingCount: (state) =>
      state.entries.filter((e) => e.status === 'WAITING').length,
    avgWaitTime: (state) => state.activeQueue?.avgServiceMins,
    totalCount: (state) => state.entries.length,
    hasError: (state) => !!state.error,
    canJoinWithParty: (state) => state.activeQueue?.allowPartyJoining ?? false,
    maxAllowedPartySize: (state) => state.activeQueue?.maxPartySize ?? 1,
    isStreamConnected: (state) => state.streamState === 'open',
  },

  actions: {
    setActiveQueue(queue: QueueRecord) {
      this.activeQueue = queue
    },

    setLiveQueueState(payload: QueueRecord) {
      this.activeQueue = payload
    },

    async fetchActiveQueue() {
      this.isLoading = true
      this.error = null
      try {
        const payload = await getLiveQueue()
        this.setLiveQueueState(payload)
        return payload
      } catch (e: any) {
        if (e?.response?.status === 404) {
          this.activeQueue = null
          this.entries = []
        } else {
          this.error = e?.response?.data?.message || 'Failed to fetch active queue'
        }
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchQueueById(id: string) {
      this.isLoading = true
      this.error = null
      try {
        const payload = await getLiveQueueById(id)
        this.setLiveQueueState(payload)
        return payload
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to fetch queue'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async initializeActiveQueue() {
      const queue = await this.fetchActiveQueue()
      if (queue?.id) {
        this.connectToEvents(queue.id)
      }
      return queue
    },

    async initializeQueueById(id: string) {
      const queue = await this.fetchQueueById(id)
      if (queue?.id) {
        this.connectToEvents(queue.id)
      }
      return queue
    },

    updateEntries(newEntries: QueueEntry[]) {
      this.entries = newEntries
    },

    upsertEntry(entry: QueueEntry) {
      const index = this.entries.findIndex((current: QueueEntry) => current.id === entry.id)
      if (index === -1) {
        this.entries = [...this.entries, entry].sort((left: QueueEntry, right: QueueEntry) => left.position - right.position)
        return
      }

      const nextEntries = [...this.entries]
      nextEntries[index] = entry
      this.entries = nextEntries.sort((left, right) => left.position - right.position)
    },

    setQueueStatus(status: QueueStatus) {
      if (!this.activeQueue) {
        return
      }

      this.activeQueue.status = status
    },

    connectToEvents(queueId?: string) {
      const targetQueueId = queueId || this.activeQueue?.id
      if (!targetQueueId) {
        return
      }

      // If the same queue is already connected, do nothing
      if (connectedQueueId === targetQueueId && queueEventsClient?.isActive()) {
        return
      }

      this.disconnectLiveUpdates()
      this.streamState = 'connecting'

      queueEventsClient = createSseClient({
        url: buildApiUrl(API_ROUTES.QUEUE.CONNECT_EVENTS(targetQueueId)),
        withCredentials: true,
        onOpen: () => {
          this.streamState = 'open'
          this.error = null
        },
        onError: () => {
          this.streamState = 'error'
        },
        events: {
          queue_update: (payload) => {
            const event = payload as QueueSseEnvelopeMap['queue_update']
            this.updateEntries(normalizeLiveQueueEntries(event.data || []))
          },
          user_joined: (payload) => {
            const event = payload as QueueSseEnvelopeMap['user_joined']
            if (!event.data) {
              return
            }

            this.upsertEntry(normalizeQueueEntry(event.data))
          },
          user_called: (payload) => {
            const event = payload as QueueSseEnvelopeMap['user_called']
            this.applyEntryStatus(event.data)
          },
          user_status_changed: (payload) => {
            const event = payload as QueueSseEnvelopeMap['user_status_changed']
            this.applyEntryStatus(event.data)
          },
          queue_status_changed: (payload) => {
            const event = payload as QueueSseEnvelopeMap['queue_status_changed']
            this.setQueueStatus(event.data.status)
          },
          queue_expired: () => {
            this.handleQueueExpired()
          },
        },
      })

      connectedQueueId = targetQueueId
      queueEventsClient.connect()
    },

    disconnectLiveUpdates() {
      queueEventsClient?.disconnect()
      queueEventsClient = null
      connectedQueueId = null
      this.streamState = 'idle'
    },

    applyEntryStatus(data: QueueStatusEventData) {
      this.entries = this.entries.map((entry) =>
        entry.token === data.token
          ? { ...entry, status: data.status.toUpperCase() as any }
          : entry
      )
    },

    handleQueueExpired() {
      this.disconnectLiveUpdates()
      this.activeQueue = null
      this.entries = []
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
        this.activeQueue.status = 'active'
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to resume queue'
      }
    },

    async terminate() {
      if (!this.activeQueue) return

      this.error = null
      try {
        await terminateQueue(this.activeQueue.id)
        this.handleQueueExpired()
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to terminate queue'
      }
    },

    async addQueueEntry(guest: AddQueueEntryPayload) {
      if (!this.activeQueue) return

      this.error = null
      try {
        await addQueueEntry(this.activeQueue.id, guest)
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
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to call next guest'
      }
    },

    async callGuest(entryId: string) {
      if (!this.activeQueue) return

      this.error = null
      try {
        await callGuest(this.activeQueue.id, entryId)
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to call guest'
      }
    },

    async serveGuest(entryId: string) {
      if (!this.activeQueue) return

      this.error = null
      try {
        await serveGuest(this.activeQueue.id, entryId)
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Failed to serve guest'
      }
    },

    clearQueue() {
      this.disconnectLiveUpdates()
      this.activeQueue = null
      this.entries = []
      this.error = null
    },

    clearError() {
      this.error = null
    },
  },
})
