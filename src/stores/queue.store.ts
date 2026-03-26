import { defineStore } from 'pinia'
import { API_ROUTES, buildApiUrl } from '@/config/api.constants'
import { createSseClient, type SseClient, type SseConnectionState } from '@/lib/sse'
import type {
    QueueEntry,
    QueueStatus,
    QueueRecord,
    QueueSseEnvelopeMap,
    QueueStatusEventData,
    AddQueueEntryPayload,
    UpdateQueuePayload,
} from '@/modules/app/queue/types'
import {
    getLiveQueue,
    getLiveQueueById,
    getQueueStatus,
    pauseQueue,
    resumeQueue,
    terminateQueue,
    addQueueEntry as apiAddQueueEntry,
    callNext as apiCallNext,
    updateQueue as apiUpdateQueue,
    callGuest as apiCallGuest,
    serveGuest as apiServeGuest,
} from '@/modules/app/queue/actions/queue.action'
import {
    normalizeLiveQueueEntries,
    normalizeQueueEntry,
} from '@/modules/app/queue/transforms'

export const useQueueStore = defineStore('queue', {
    state: () => ({
        activeQueue: null as QueueRecord | null,
        entries: [] as QueueEntry[],
        isLoading: false,
        error: null as string | null,
        streamState: 'idle' as SseConnectionState,
        sseClient: null as SseClient | null,
        connectedQueueId: null as string | null,
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
            if (payload.entries) {
                this.entries = normalizeLiveQueueEntries(payload.entries)
            }
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
                    this.clearQueue()
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

        async revalidate(id: string) {
            this.connectToEvents(id)
            try {
                const statusData = await getQueueStatus(id)
                if (this.activeQueue && this.activeQueue.id === id) {
                    this.activeQueue.status = statusData.status
                    this.activeQueue.avgServiceMins = statusData.avgServiceMins
                    this.activeQueue.joinCode = statusData.joinCode
                } else if (!this.activeQueue) {
                    await this.initializeQueueById(id)
                }
            } catch (err: any) {
                if (err.response?.status === 404 || err.response?.status === 410) {
                    this.clearQueue()
                }
            }
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

        connectToEvents(queueId: string) {
            // Don't reconnect if already connected to the same queue and it's active
            if (this.sseClient && this.connectedQueueId === queueId && (this.streamState === 'open' || this.streamState === 'connecting')) {
                return
            }

            this.disconnectLiveUpdates()

            // Auto-reconnect on visibility change - only if not already added
            if (!(window as any)._q_visibility_handler) {
                const handler = () => {
                    if (document.visibilityState === 'visible' && this.connectedQueueId) {
                        this.revalidate(this.connectedQueueId)
                    }
                }
                document.addEventListener('visibilitychange', handler)
                    ; (window as any)._q_visibility_handler = handler
            }

            this.connectedQueueId = queueId

            this.sseClient = createSseClient({
                url: buildApiUrl(API_ROUTES.QUEUE.CONNECT_EVENTS(queueId)),
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
                        if (event.data) {
                            this.upsertEntry(normalizeQueueEntry(event.data))
                        }
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
                        this.clearQueue()
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
            this.sseClient = null
            this.connectedQueueId = null
            this.streamState = 'idle'

            // Remove the visibility listener when disconnecting
            if ((window as any)._q_visibility_handler) {
                document.removeEventListener('visibilitychange', (window as any)._q_visibility_handler)
                delete (window as any)._q_visibility_handler
            }
        },

        applyEntryStatus(data: QueueStatusEventData) {
            this.entries = this.entries.map((entry) =>
                entry.id === data.token || entry.id === (data as any).id
                    ? { ...entry, status: data.status.toUpperCase() as any }
                    : entry
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
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to pause queue'
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
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to resume queue'
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
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to terminate queue'
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
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to add guest'
                return false
            }
        },

        async callNext(): Promise<boolean> {
            if (!this.activeQueue) return false

            this.error = null
            try {
                await apiCallNext(this.activeQueue.id)
                return true
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to call next guest'
                return false
            }
        },

        async callGuest(entryId: string): Promise<boolean> {
            if (!this.activeQueue) return false

            this.error = null
            try {
                await apiCallGuest(this.activeQueue.id, entryId)
                return true
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to call guest'
                return false
            }
        },

        async serveGuest(entryId: string): Promise<boolean> {
            if (!this.activeQueue) return false

            this.error = null
            try {
                await apiServeGuest(this.activeQueue.id, entryId)
                return true
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to serve guest'
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
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to update queue'
                return false
            } finally {
                this.isLoading = false
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
    persist: {
        pick: ['activeQueue', 'entries', 'servedEntries', 'servedTodayCount', 'error'],
    },
})
