import { defineStore } from 'pinia'

import { API_ROUTES, buildApiUrl } from '@/config/api.constants'
import { getFCMTokenDetails } from '@/lib/firebase'
import { createSseClient, type SseClient, type SseConnectionState } from '@/lib/sse'
import { fetchHistory, fetchHistoryDetail } from '@/modules/app/history/actions/history.action'
import type {
  HistoryDetail,
  HistoryQueryParams,
  HistoryQueryResult,
} from '@/modules/app/history/types'
import {
  addQueueEntry as apiAddQueueEntry,
  callEntry as apiCallEntry,
  claimQueue as apiClaimQueue,
  registerHostFCM as apiRegisterHostFCM,
  serveGuest as apiServeGuest,
  skipGuest as apiSkipGuest,
  unregisterHostFCM as apiUnregisterHostFCM,
  updateQueue as apiUpdateQueue,
  findQueueByIdOrSlugOrCode,
  getLiveQueue,
  getLiveQueueById,
  getPublicStatus,
  pauseQueue,
  resumeQueue,
  terminateQueue,
} from '@/modules/app/queue/actions/queue.action'
import {
  ENTRY_STATUS,
  QUEUE_ERROR_REASONS,
  QUEUE_STATUS,
  type QueueEntryStatus,
  type QueueStatus,
} from '@/modules/app/queue/constants'
import { normalizeLiveQueueEntries, normalizeQueueEntry } from '@/modules/app/queue/transforms'
import type {
  AddQueueEntryPayload,
  QueueEntry,
  QueueRecord,
  QueueSseEnvelopeMap,
  QueueStatusEventData,
  UpdateQueuePayload,
} from '@/modules/app/queue/types'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { ApiError, getErrorMessage } from '@/utils/api-response'

import { useAuthStore } from './auth.store'
import { useDashboardStore } from './dashboard.store'
import { useNotificationStore } from './notification.store'

let visibilityHandler: (() => void) | null = null

export const useQueueStore = defineStore('queue', {
  state: () => ({
    activeQueue: null as QueueRecord | null,
    entries: [] as QueueEntry[],
    isLoading: false,
    isRefreshing: false,
    error: null as string | null,
    streamState: 'idle' as SseConnectionState,
    sseClient: null as SseClient | null,
    connectedQueueId: null as string | null,
    publicWaitingCount: null as number | null,
    publicSseClient: null as SseClient | null,
    hostFcmToken: null as string | null,
    isFcmRegistering: false,
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
    addLiveNotification(
      title: string,
      message: string,
      type: 'info' | 'success' | 'warning' | 'error' = 'info',
      dedupeKey?: string,
    ) {
      useNotificationStore().addNotification({
        title,
        message,
        type,
        dedupeKey,
      })
    },

    setActiveQueue(queue: QueueRecord) {
      this.activeQueue = queue
      if (queue.entries) {
        this.entries = normalizeLiveQueueEntries(queue.entries)
      }
      this.error = null
    },

    async fetchActiveQueue(options?: { skipLogout?: boolean; silent?: boolean }) {
      if (options?.silent) {
        this.isRefreshing = true
      } else {
        this.isLoading = true
      }
      this.error = null
      try {
        const payload = await getLiveQueue(options)
        this.setActiveQueue(payload)
        return payload
      } catch (e: unknown) {
        const error = e as ApiError
        if (error.response?.status === 404) {
          this.clearQueue()
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
        this.isRefreshing = false
      }
    },

    async fetchQueueById(id: string, silent = false) {
      if (silent) {
        this.isRefreshing = true
      } else {
        this.isLoading = true
      }
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
        this.isRefreshing = false
      }
    },

    async fetchPublicStatus(id: string, silent = false) {
      if (silent) {
        this.isRefreshing = true
      } else {
        this.isLoading = true
      }
      this.error = null
      try {
        const payload = await getPublicStatus(id)
        this.activeQueue = payload.queue
        this.entries = (payload.entries || []).map(normalizeQueueEntry)
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
        this.isRefreshing = false
      }
    },

    async initializeActiveQueue(silent = false) {
      const queue = await this.fetchActiveQueue({ silent })
      if (queue?.id) {
        this.connectToEvents(queue.id)
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          await this.registerHostFCM(queue.id)
        }
      }
      return queue
    },

    async IntializeQueueByIdOrCode(id?: string, code?: string, silent = false) {
      if (!silent) this.isLoading = true
      try {
        const queue = await this.fetchQueueByIdOrSlugOrCode(id, code)
        if (queue) {
          this.connectToPublicEvents(queue.id)
        }
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
      // Diff the list to identify actions that occurred while offline/backgrounded
      if (this.entries.length > 0) {
        newEntries.forEach((entry) => {
          const existingEntry = this.entries.find((e) => e.id === entry.id)
          if (existingEntry) {
            // Existing guest status changed while offline
            if (
              existingEntry.status !== ENTRY_STATUS.ARRIVED &&
              entry.status === ENTRY_STATUS.ARRIVED
            ) {
              this.addLiveNotification(
                'Guest Arrived!',
                `${entry.name} (${entry.ticketNo}) has arrived.`,
                'success',
                `host-arrived-${entry.id}`,
              )
            }
          } else {
            // New guest joined while we were offline!
            if (entry.status === ENTRY_STATUS.ARRIVED) {
              this.addLiveNotification(
                'Guest Arrived!',
                `${entry.name} (${entry.ticketNo}) has arrived.`,
                'success',
                `host-arrived-${entry.id}`,
              )
            } else {
              this.addLiveNotification(
                'New Guest Joined',
                `${entry.name} is now waiting with ticket ${entry.ticketNo}.`,
                'info',
                `host-joined-${entry.id}`,
              )
            }
          }
        })

        // Identify guests who left the queue while we were offline.
        // If a guest was in an active state in our list (WAITING, CALLED, ARRIVED, IDLE)
        // but is completely absent from the new snapshot, it means they left/were removed.
        const newEntryIds = new Set(newEntries.map((e) => e.id))
        const activeStatuses = [
          ENTRY_STATUS.WAITING,
          ENTRY_STATUS.CALLED,
          ENTRY_STATUS.ARRIVED,
          ENTRY_STATUS.IDLE,
        ] as string[]
        this.entries.forEach((existingEntry) => {
          if (activeStatuses.includes(existingEntry.status) && !newEntryIds.has(existingEntry.id)) {
            this.addLiveNotification(
              'Guest Left Queue',
              'A guest has removed themselves from the queue.',
              'warning',
              `host-left-${existingEntry.id}`,
            )
          }
        })
      }

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

      this.entries = [...newEntries, ...historicalToKeep].toSorted((left, right) => {
        // Keep the sort by position if possible, otherwise by timestamp or ID
        const lp = left.position ?? 999999
        const rp = right.position ?? 999999
        return lp - rp
      })
    },

    upsertEntry(entry: QueueEntry) {
      const index = this.entries.findIndex((current: QueueEntry) => current.id === entry.id)
      if (index === -1) {
        this.entries = [...this.entries, entry].toSorted(
          (left: QueueEntry, right: QueueEntry) =>
            (left.position ?? 9999) - (right.position ?? 9999),
        )
        return
      }

      const nextEntries = [...this.entries]
      nextEntries[index] = entry
      this.entries = nextEntries.toSorted(
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
            this.clearQueue(true)
          }
        },
        events: {
          waiting_count_updated: (payload: QueueSseEnvelopeMap['waiting_count_updated']) => {
            // The backend sends { event: '...', data: { count: N } }
            const count = payload.data?.count
            if (count !== undefined) {
              this.publicWaitingCount = count
            }
            const avgMins = payload.data?.avgServiceMins
            if (avgMins !== undefined && this.activeQueue) {
              this.activeQueue.avgServiceMins = avgMins
            }
            const bufferMins = payload.data?.bufferMins
            if (bufferMins !== undefined && this.activeQueue) {
              this.activeQueue.bufferMins = bufferMins
            }
          },
          queue_status_changed: (payload: QueueSseEnvelopeMap['queue_status_changed']) => {
            const status = payload.data?.status
            if (status) {
              this.setQueueStatus(status)

              // If queue is ended/expired, notify customer store to clear session
              if (status === 'CLOSED' || status === 'EXPIRED') {
                useCustomerStore().onGlobalQueueEnd()
              }
            }
          },
          joined: (payload: QueueSseEnvelopeMap['joined']) => {
            if (payload.data) {
              const entry = normalizeQueueEntry(payload.data)
              this.upsertEntry(entry)
            }
          },
          called: (payload: QueueSseEnvelopeMap['called']) => {
            this.applyEntryStatus(payload.data)
          },
          user_status_changed: (payload: QueueSseEnvelopeMap['user_status_changed']) => {
            if (payload.data) {
              this.applyEntryStatus(payload.data)
            }
          },
          user_arrived: (payload: QueueSseEnvelopeMap['user_arrived']) => {
            if (payload.data) {
              this.applyEntryStatus({ id: payload.data.id, status: ENTRY_STATUS.ARRIVED })
            }
          },
          user_updated: (payload: QueueSseEnvelopeMap['user_updated']) => {
            if (payload.data) {
              const entry = normalizeQueueEntry(payload.data)
              this.upsertEntry(entry)
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
              this.addLiveNotification(
                'New Guest Joined',
                `${entry.name} is now waiting with ticket ${entry.ticketNo}.`,
                'info',
                `host-joined-${entry.id}`,
              )
            }
          },
          called: (payload: QueueSseEnvelopeMap['called']) => {
            if (payload.data) {
              this.applyEntryStatus(payload.data)
            }
          },
          user_status_changed: (payload: QueueSseEnvelopeMap['user_status_changed']) => {
            const data = payload.data
            if (data) {
              this.applyEntryStatus(data)

              if (data.status?.toUpperCase() === ENTRY_STATUS.LEFT) {
                this.addLiveNotification(
                  'Guest Left Queue',
                  'A guest has removed themselves from the queue.',
                  'warning',
                  `host-left-${data.id}`,
                )
              }
            }
          },
          user_arrived: (payload: QueueSseEnvelopeMap['user_arrived']) => {
            const data = payload.data
            if (data) {
              this.applyEntryStatus({ id: data.id, status: ENTRY_STATUS.ARRIVED })
              this.addLiveNotification(
                'Guest Arrived!',
                `${data.name} (${data.ticketNumber}) has arrived.`,
                'success',
                `host-arrived-${data.id}`,
              )
            }
          },
          user_updated: (payload: QueueSseEnvelopeMap['user_updated']) => {
            if (payload.data) {
              const entry = normalizeQueueEntry(payload.data)
              this.upsertEntry(entry)
            }
          },
          queue_status_changed: (payload: QueueSseEnvelopeMap['queue_status_changed']) => {
            const status = payload.data.status.toUpperCase() as QueueStatus
            this.setQueueStatus(status)

            if (status === QUEUE_STATUS.CLOSED || status === QUEUE_STATUS.EXPIRED) {
              this.clearQueue()
              this.error = QUEUE_ERROR_REASONS.SESSION_EXPIRED
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
          ? {
              ...entry,
              status: data.status.toUpperCase() as QueueEntryStatus,
              servedAt:
                data.status.toUpperCase() === ENTRY_STATUS.SERVED
                  ? entry.servedAt || new Date().toISOString()
                  : entry.servedAt,
            }
          : entry,
      )
    },

    async pause(): Promise<boolean> {
      if (!this.activeQueue) return false

      this.isRefreshing = true
      this.error = null
      try {
        await pauseQueue(this.activeQueue.id)
        if (this.activeQueue) {
          this.activeQueue.status = QUEUE_STATUS.PAUSED
        }
        return true
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to pause queue')
        return false
      } finally {
        this.isRefreshing = false
      }
    },

    async resume(): Promise<boolean> {
      if (!this.activeQueue) return false

      this.isRefreshing = true
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
        this.isRefreshing = false
      }
    },

    async terminate(): Promise<boolean> {
      if (!this.activeQueue) return false

      this.isLoading = true
      this.error = null
      const queueId = this.activeQueue.id
      this.disconnectLiveUpdates()
      try {
        await terminateQueue(queueId)
        this.clearQueue()
        useDashboardStore().setDirty()
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
        const entry = await apiAddQueueEntry(this.activeQueue.id, guest)
        this.upsertEntry(normalizeQueueEntry(entry))
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

    async skipGuest(entryId: string): Promise<boolean> {
      if (!this.activeQueue) return false

      this.error = null
      try {
        await apiSkipGuest(this.activeQueue.id, entryId)
        return true
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to skip guest')
        return false
      }
    },

    async updateQueue(
      payload: UpdateQueuePayload,
      options: { silent?: boolean } = {},
    ): Promise<boolean> {
      if (!this.activeQueue) return false

      if (options.silent) {
        this.isRefreshing = true
      } else {
        this.isLoading = true
      }

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
        this.isRefreshing = false
      }
    },

    async registerHostFCM(queueId?: string) {
      const qid = queueId || this.activeQueue?.id
      if (!qid) {
        return false
      }
      this.isFcmRegistering = true

      try {
        const { token, reason, detail } = await getFCMTokenDetails()
        if (token) {
          if (this.hostFcmToken === token) {
            this.error = null
            return true
          }

          await apiRegisterHostFCM(qid, token)
          this.hostFcmToken = token
          this.error = null
          return true
        } else {
          // eslint-disable-next-line no-console
          console.warn('FCM registration skipped:', reason, detail)
          this.error =
            reason === 'permission-not-granted'
              ? 'Notification permission is not granted.'
              : detail || 'Failed to get a notification token.'
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to register host FCM:', e)
        this.error = 'Failed to register notifications.'
      } finally {
        this.isFcmRegistering = false
      }
      return false
    },

    /**
     * claimAnonymousQueue
     * Links an anonymous/guest queue to the current authenticated host.
     * @param id - The ID of the queue to claim (optional, backend can use session if missing)
     */
    async claimAnonymousQueue(id: string): Promise<boolean> {
      this.isLoading = true
      this.error = null
      try {
        await apiClaimQueue(id)
        // After claiming, we re-fetch to get the newly claimed active queue
        await this.fetchActiveQueue()
        if (this.activeQueue) {
          this.connectToEvents(this.activeQueue.id)
        }
        return true
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to claim guest queue')
        return false
      } finally {
        this.isLoading = false
      }
    },

    async unregisterHostFCM() {
      if (!this.activeQueue) return
      await apiUnregisterHostFCM(this.activeQueue.id)
      this.hostFcmToken = null
    },

    clearQueue(keepError = false) {
      this.disconnectLiveUpdates()
      this.activeQueue = null
      this.entries = []
      this.isLoading = false
      if (!keepError) {
        this.error = null
      }
      this.streamState = 'idle'
      this.sseClient = null
      this.connectedQueueId = null
      this.publicWaitingCount = null
      this.publicSseClient = null
      this.hostFcmToken = null
      this.isFcmRegistering = false
      useNotificationStore().clearNotifications()
      useAuthStore().setAnonymousHostSession(null)
    },

    clearError() {
      this.error = null
    },

    async fetchHistoryQueues(params: HistoryQueryParams): Promise<HistoryQueryResult> {
      this.isLoading = true
      this.error = null
      try {
        return await fetchHistory(params)
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to fetch queue history')
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async fetchHistoryDetail(id: string): Promise<HistoryDetail> {
      this.isLoading = true
      this.error = null
      try {
        return await fetchHistoryDetail(id)
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to fetch queue detail')
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async fetchQueueByIdOrSlugOrCode(id?: string, code?: string) {
      this.isLoading = true
      this.error = null
      try {
        const result = await findQueueByIdOrSlugOrCode(id, code)
        if (result) {
          this.setActiveQueue(result)
          return result
        }
        return null
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
  },
  persist: {
    pick: ['activeQueue', 'hostFcmToken'],
  },
})
