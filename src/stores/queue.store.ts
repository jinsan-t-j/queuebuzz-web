import { defineStore } from 'pinia'

import { API_ROUTES, buildApiUrl } from '@/config/api.constants'
import { createSseClient, type SseClient, type SseConnectionState } from '@/lib/sse'
import type {
  QueueEntry,
  QueueRecord,
  QueueSseEnvelopeMap,
  QueueStatusEventData,
  AddQueueEntryPayload,
  UpdateQueuePayload,
} from '@/modules/app/queue/types'
import {
  getLiveQueue,
  getLiveQueueById,
  pauseQueue,
  resumeQueue,
  terminateQueue,
  addQueueEntry as apiAddQueueEntry,
  callEntry as apiCallEntry,
  updateQueue as apiUpdateQueue,
  serveGuest as apiServeGuest,
} from '@/modules/app/queue/actions/queue.action'
import { normalizeLiveQueueEntries, normalizeQueueEntry } from '@/modules/app/queue/transforms'
import {
  QUEUE_ERROR_REASONS,
  QUEUE_STATUS,
  ENTRY_STATUS,
  type QueueStatus,
  type QueueEntryStatus,
} from '@/modules/app/queue/constants'
import { useNotificationStore } from './notification.store'
import { ApiError, getErrorMessage } from '@/utils/api-response'

let visibilityHandler: (() => void) | null = null

export const useQueueStore = defineStore('queue', {
  state: () => ({
    activeQueue: null as QueueRecord | null,
    entries: [] as QueueEntry[],
    isLoading: false,
    error: null as string | null,
    streamState: 'idle' as SseConnectionState,
    sseClient: null as SseClient | null,
    connectedQueueId: null as string | null,
    publicWaitingCount: null as number | null,
    publicSseClient: null as SseClient | null,
  }),

  getters: {
    isPaused: (state) => state.activeQueue?.status === QUEUE_STATUS.PAUSED,
    waitingCount: (state): number => {
      if (state.entries.length > 0) {
        return state.entries.filter((e) =>
          (
            [
              ENTRY_STATUS.WAITING,
              ENTRY_STATUS.CALLED,
              ENTRY_STATUS.ARRIVED,
              ENTRY_STATUS.IDLE,
            ] as string[]
          ).includes(e.status),
        ).length
      }
      return state.publicWaitingCount || 0
    },
    avgWaitTime: (state): number => {
      if (!state.activeQueue) return 0
      const count =
        state.entries.length > 0
          ? state.entries.filter((e) =>
              (
                [
                  ENTRY_STATUS.WAITING,
                  ENTRY_STATUS.CALLED,
                  ENTRY_STATUS.ARRIVED,
                  ENTRY_STATUS.IDLE,
                ] as string[]
              ).includes(e.status),
            ).length
          : state.publicWaitingCount || 0
      return (state.activeQueue.avgServiceMins || 0) * count
    },
    totalCount: (state) => state.entries.length || state.publicWaitingCount || 0,
    hasError: (state) => !!state.error,
    canJoinWithParty: (state) => state.activeQueue?.allowPartyJoining ?? false,
    maxAllowedPartySize: (state) => state.activeQueue?.maxPartySize ?? 1,
    isStreamConnected: (state) => state.streamState === 'open',
  },

  actions: {
    setActiveQueue(queue: QueueRecord) {
      this.activeQueue = queue
      if (queue.entries) {
        this.entries = normalizeLiveQueueEntries(queue.entries)
      }
      this.error = null
    },

    async fetchActiveQueue() {
      this.isLoading = true
      this.error = null
      try {
        const payload = await getLiveQueue()
        this.setActiveQueue(payload)
        return payload
      } catch (e: unknown) {
        const error = e as ApiError
        if (error.response?.status === 404) {
          this.clearQueue()
          this.error = QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND
        } else if (error.response?.status === 401) {
          this.clearQueue()
          this.error = QUEUE_ERROR_REASONS.SESSION_EXPIRED
        } else if (error.response?.status === 403) {
          this.error = QUEUE_ERROR_REASONS.UNAUTHORIZED
        } else {
          this.error = error.response?.data?.message || QUEUE_ERROR_REASONS.UNKNOWN
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
        this.setActiveQueue(payload)
        return payload
      } catch (e: unknown) {
        const error = e as ApiError
        if (error.response?.status === 404) {
          this.error = QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND
        } else if (error.response?.status === 401) {
          this.error = QUEUE_ERROR_REASONS.SESSION_EXPIRED
        } else if (error.response?.status === 403) {
          this.error = QUEUE_ERROR_REASONS.UNAUTHORIZED
        } else if (error.response?.status === 410) {
          this.error = QUEUE_ERROR_REASONS.QUEUE_ENDED
        } else {
          this.error = error.response?.data?.message || QUEUE_ERROR_REASONS.UNKNOWN
        }
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
      this.isLoading = true
      try {
        // First, get the metadata via REST for faster FCP/LCP
        await this.fetchQueueById(id)
        // Then connect to live events
        this.connectToPublicEvents(id)
        return !!this.activeQueue
      } finally {
        this.isLoading = false
      }
    },

    async revalidate(id: string) {
      if (!id) return

      // If we already have this queue active, just ensure we're connected to its live events
      if (this.activeQueue && (this.activeQueue.id === id || this.activeQueue.slug === id)) {
        this.connectToEvents(this.activeQueue.id)
        return
      }

      // If missing from memory (e.g. on page refresh), fetch it directly by the ID from the URL
      const queue = await this.fetchQueueById(id)
      if (queue) {
        this.connectToEvents(queue.id)
      }
    },

    /**
     * Updates the local entries list from a new snapshot.
     * We MERGE the new snapshot with our existing terminal status entries (SERVED, etc)
     * because the backend may exclude them from live broadcasts to save bandwidth.
     */
    updateEntries(newEntries: QueueEntry[]) {
      // 1. Identify all current entries that are in a terminal state
      const terminalEntries = this.entries.filter((e) =>
        ([ENTRY_STATUS.SERVED, ENTRY_STATUS.LEFT, ENTRY_STATUS.SKIPPED] as string[]).includes(
          e.status,
        ),
      )

      // 3. The new snapshot is our source of truth for active entries.
      // But if a terminal entry is somehow in the snapshot, we take the new one.
      const snapshotIds = new Set(newEntries.map((e) => e.id))

      // 4. Final List = Snapshot + (Historical entries NOT in snapshot)
      const historicalToKeep = terminalEntries.filter((e) => !snapshotIds.has(e.id))

      this.entries = [...newEntries, ...historicalToKeep].sort((left, right) => {
        // Keep the sort by position if possible, otherwise by timestamp or ID
        const lp = left.position ?? 999999
        const rp = right.position ?? 999999
        return lp - rp
      })
    },

    upsertEntry(entry: QueueEntry) {
      const index = this.entries.findIndex((current: QueueEntry) => current.id === entry.id)
      if (index === -1) {
        this.entries = [...this.entries, entry].sort(
          (left: QueueEntry, right: QueueEntry) =>
            (left.position ?? 9999) - (right.position ?? 9999),
        )
        return
      }

      const nextEntries = [...this.entries]
      nextEntries[index] = entry
      this.entries = nextEntries.sort(
        (left: QueueEntry, right: QueueEntry) => (left.position ?? 9999) - (right.position ?? 9999),
      )
    },

    setQueueStatus(status: QueueStatus) {
      if (!this.activeQueue) {
        return
      }

      this.activeQueue.status = status
    },

    connectToPublicEvents(queueId: string) {
      if (this.publicSseClient && this.connectedQueueId === queueId) return

      this.connectedQueueId = queueId

      this.publicSseClient = createSseClient({
        url: buildApiUrl(API_ROUTES.QUEUE.PUBLIC_EVENTS(queueId)),
        onOpen: () => {
          this.error = null
        },
        onError: (e) => {
          if (e.status === 401) {
            this.error = QUEUE_ERROR_REASONS.SESSION_EXPIRED
          } else if (e.status === 403) {
            this.error = QUEUE_ERROR_REASONS.UNAUTHORIZED
          } else if (e.status === 404) {
            this.error = QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND
          } else if (e.status === 410) {
            this.error = QUEUE_ERROR_REASONS.QUEUE_ENDED
          }

          if (this.error) {
            this.clearQueue()
          }
        },
        events: {
          queue_init: (payload: QueueSseEnvelopeMap['queue_init']) => {
            if (payload.data) {
              this.activeQueue = payload.data
              this.publicWaitingCount = payload.data.entries?.length || this.publicWaitingCount
            }
          },
          waiting_count_updated: (payload: QueueSseEnvelopeMap['waiting_count_updated']) => {
            // The backend sends { event: '...', data: { count: N } }
            const count = payload.data?.count
            if (count !== undefined) {
              this.publicWaitingCount = count
            }
          },
          queue_status_changed: (payload: QueueSseEnvelopeMap['queue_status_changed']) => {
            // Handle both envelope structure and flat structure
            const status = payload.data?.status
            if (status) {
              this.setQueueStatus(status)
            }
          },
        },
      })

      this.publicSseClient.connect()
    },

    connectToEvents(queueId: string) {
      if (
        this.sseClient &&
        this.connectedQueueId === queueId &&
        (this.streamState === 'open' || this.streamState === 'connecting')
      ) {
        return
      }

      this.connectedQueueId = queueId
      const notifyStore = useNotificationStore()

      // Single Visibility Listener setup for the duration of this queue's monitoring
      if (!visibilityHandler) {
        const handler = () => {
          const id = this.connectedQueueId
          if (!id) return

          if (document.visibilityState === 'visible') {
            this.revalidate(id)
          } else if (document.visibilityState === 'hidden') {
            this.sseClient?.disconnect()
            this.publicSseClient?.disconnect()
            this.streamState = 'idle'
          }
        }
        document.addEventListener('visibilitychange', handler)
        visibilityHandler = handler
      }

      this.sseClient = createSseClient({
        url: buildApiUrl(API_ROUTES.QUEUE.CONNECT_EVENTS(queueId)),
        withCredentials: true,
        onOpen: () => {
          this.streamState = 'open'
          this.error = null
        },
        onError: (e) => {
          this.streamState = 'error'

          if (e.status === 401) {
            this.error = QUEUE_ERROR_REASONS.SESSION_EXPIRED
          } else if (e.status === 403) {
            this.error = QUEUE_ERROR_REASONS.UNAUTHORIZED
          } else if (e.status === 404) {
            this.error = QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND
          } else if (e.status === 410) {
            this.error = QUEUE_ERROR_REASONS.QUEUE_ENDED
          }

          if (this.error) {
            this.clearQueue()
          }
        },
        events: {
          queue_update: (payload: QueueSseEnvelopeMap['queue_update']) => {
            this.updateEntries((payload.data || []).map(normalizeQueueEntry))
          },
          joined: (payload: QueueSseEnvelopeMap['joined']) => {
            if (payload.data) {
              const entry = normalizeQueueEntry(payload.data)
              this.upsertEntry(entry)

              // Only toast for guests who didn't join via host (public joins)
              if (!entry.createdBy) {
                notifyStore.addNotification({
                  title: 'New Guest!',
                  message: `${entry.name} joined the queue (Ticket #${entry.ticketNo})`,
                  type: 'success',
                })
              }
            }
          },
          called: (payload: QueueSseEnvelopeMap['called']) => {
            this.applyEntryStatus(payload.data)
          },
          user_status_changed: (payload: QueueSseEnvelopeMap['user_status_changed']) => {
            const data = payload.data
            const entry = this.entries.find((e) => e.id === data.id)

            this.applyEntryStatus(data)

            if (data.status == ENTRY_STATUS.LEFT && entry) {
              notifyStore.addNotification({
                title: 'Guest Left',
                message: `${entry.name} (Ticket ${entry.ticketNo}) has left the queue.`,
                type: 'info',
              })
            }
          },
          user_arrived: (payload: QueueSseEnvelopeMap['user_arrived']) => {
            const data = payload.data
            this.applyEntryStatus({ id: data.id, status: ENTRY_STATUS.ARRIVED })
            notifyStore.addNotification({
              title: 'Guest at door!',
              message: `${data.name} (Ticket ${data.ticketNumber}) has arrived.`,
              type: 'info',
            })
          },
          queue_status_changed: (payload: QueueSseEnvelopeMap['queue_status_changed']) => {
            const status = payload.data.status.toUpperCase() as QueueStatus
            this.setQueueStatus(status)

            if (status === QUEUE_STATUS.CLOSED || status === QUEUE_STATUS.EXPIRED) {
              this.clearQueue()
              this.error = QUEUE_ERROR_REASONS.SESSION_EXPIRED
              notifyStore.addNotification({
                title: status === QUEUE_STATUS.EXPIRED ? 'Queue Expired' : 'Queue Ended',
                message:
                  status === QUEUE_STATUS.EXPIRED
                    ? 'This session has ended.'
                    : 'The host has ended this session.',
                type: status === QUEUE_STATUS.EXPIRED ? 'warning' : 'info',
              })
            }
          },
        },
      })

      if (this.sseClient && typeof this.sseClient.connect === 'function') {
        this.streamState = 'connecting'
        this.sseClient.connect()
      }
    },

    disconnectLiveUpdates() {
      if (this.sseClient && typeof this.sseClient.disconnect === 'function') {
        this.sseClient.disconnect()
      }
      if (this.publicSseClient && typeof this.publicSseClient.disconnect === 'function') {
        this.publicSseClient.disconnect()
      }
      this.sseClient = null
      this.publicSseClient = null
      this.connectedQueueId = null
      this.streamState = 'idle'
      this.error = null

      // Clean up the visibility listener when explicitly stopping all updates
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler)
        visibilityHandler = null
      }
    },

    applyEntryStatus(data: QueueStatusEventData) {
      this.entries = this.entries.map((entry) =>
        entry.id === data.id
          ? { ...entry, status: data.status.toUpperCase() as QueueEntryStatus }
          : entry,
      )
    },

    async pause(): Promise<boolean> {
      if (!this.activeQueue) return false

      this.isLoading = true
      this.error = null
      try {
        await pauseQueue(this.activeQueue.id)
        if (this.activeQueue) {
          this.activeQueue.status = 'paused'
        }
        return true
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to pause queue')
        return false
      } finally {
        this.isLoading = false
      }
    },

    async resume(): Promise<boolean> {
      if (!this.activeQueue) return false

      this.isLoading = true
      this.error = null
      try {
        await resumeQueue(this.activeQueue.id)
        if (this.activeQueue) {
          this.activeQueue.status = 'active'
        }
        return true
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to resume queue')
        return false
      } finally {
        this.isLoading = false
      }
    },

    async terminate(): Promise<boolean> {
      if (!this.activeQueue) return false

      this.isLoading = true
      this.error = null
      try {
        await terminateQueue(this.activeQueue.id)
        this.clearQueue()
        return true
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to terminate queue')
        return false
      } finally {
        this.isLoading = false
      }
    },

    async addQueueEntry(guest: AddQueueEntryPayload): Promise<boolean> {
      if (!this.activeQueue) return false

      this.error = null
      try {
        await apiAddQueueEntry(this.activeQueue.id, guest)
        return true
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to add guest')
        return false
      }
    },

    async callEntry(entryId?: string): Promise<boolean> {
      if (!this.activeQueue) return false

      this.error = null
      try {
        await apiCallEntry(this.activeQueue.id, entryId)
        return true
      } catch (e: unknown) {
        const action = entryId ? 'ping guest' : 'call next guest'
        this.error = getErrorMessage(e, `Failed to ${action}`)
        return false
      }
    },

    async serveGuest(entryId: string): Promise<boolean> {
      if (!this.activeQueue) return false

      this.error = null
      try {
        await apiServeGuest(this.activeQueue.id, entryId)
        return true
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to serve guest')
        return false
      }
    },

    async updateQueue(payload: UpdateQueuePayload): Promise<boolean> {
      if (!this.activeQueue) return false
      this.isLoading = true
      this.error = null
      try {
        const updated = await apiUpdateQueue(this.activeQueue.id, payload)
        this.activeQueue = updated
        return true
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to update queue')
        return false
      } finally {
        this.isLoading = false
      }
    },

    clearQueue() {
      this.disconnectLiveUpdates()
      this.activeQueue = null
      this.entries = []
      this.publicWaitingCount = null
      this.error = null
    },

    clearError() {
      this.error = null
    },
  },
  persist: {
    pick: ['activeQueue'],
  },
})
