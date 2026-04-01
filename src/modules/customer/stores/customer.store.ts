import { defineStore } from 'pinia'
import { useQueueStore } from '@/stores/queue.store'
import { API_ROUTES, buildApiUrl } from '@/config/api.constants'
import { createSseClient, type SseClient, type SseConnectionState } from '@/lib/sse'
import type { Entry, JoinQueuePayload } from '@/modules/customer/types'
import * as CustomerActions from '@/modules/customer/actions/customer.action'
import { CUSTOMER_EVENTS } from '../events'

export const useCustomerStore = defineStore('customer', {
    state: () => ({
        entry: null as Entry | null,
        position: null as number | null,
        isLoading: false,
        error: null as string | null,
        streamState: 'idle' as SseConnectionState,
        connectedEntryId: null as string | null,
        sseClient: null as SseClient | null,
    }),

    getters: {
        isJoined: (state) => !!state.entry,
        entryId: (state) => state.entry?.id ?? null,
        status: (state) => state.entry?.status ?? null,
        ahead: (state) => (state.position != null ? Math.max(0, state.position - 1) : null),
        estWaitMin: (state) => {
            const position = state.position
            if (position == null) return null
            const ahead = Math.max(0, position - 1)
            const avgServiceMins = useQueueStore().activeQueue?.avgServiceMins ?? 0
            return ahead * avgServiceMins
        },
        isStreamConnected: (state) => state.streamState === 'open',
    },

    actions: {
        setEntry(e: Entry) {
            this.entry = {
                ...e,
                ticketNumber: e.ticketNo || e.id?.substring(0, 4).toUpperCase(),
                position: e.position ?? this.position ?? undefined
            }
            if (e.position != null) {
                this.position = e.position
            }
        },

        async joinQueue(queueId: string, payload: JoinQueuePayload): Promise<Entry | null> {
            this.isLoading = true
            this.error = null
            try {
                const result = await CustomerActions.joinQueue(queueId, payload)
                this.setEntry(result)
                return result
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to join queue'
                return null
            } finally {
                this.isLoading = false
            }
        },

        async fetchEntry(): Promise<void> {
            if (!this.entry?.id) return

            this.isLoading = true
            this.error = null
            try {
                const result = await CustomerActions.fetchEntry()
                if (result) {
                    this.setEntry(result)
                }
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to fetch status'
                if (e?.response?.status === 410 || e?.response?.status === 404) {
                    this.clearEntry()
                }
            } finally {
                this.isLoading = false
            }
        },

        async revalidate(entryId: string) {
            if (!entryId) return

            // If already connected correctly, do nothing
            if (this.entry && this.entry.id === entryId && (this.streamState === 'open' || this.streamState === 'connecting')) {
                this.connectToEvents(entryId) // This will handle idempotent connection logic
                return
            }

            try {
                // Initial data sync + connection setup
                await this.fetchEntry()
                if (this.entry?.id) {
                    this.connectToEvents(this.entry.id)
                }
            } catch (err: any) {
                if (err.response?.status === 404 || err.response?.status === 410) {
                    this.clearEntry()
                }
            }
        },

        connectToEvents(entryId: string) {
            if (this.sseClient && this.connectedEntryId === entryId && (this.streamState === 'open' || this.streamState === 'connecting')) {
                return
            }

            this.connectedEntryId = entryId

            // Visibility Listener to suspend/resume connection to save battery/network
            if (!(window as any)._c_visibility_handler) {
                const handler = () => {
                    const id = this.connectedEntryId
                    if (!id) return

                    if (document.visibilityState === 'visible') {
                        this.revalidate(id)
                    } else if (document.visibilityState === 'hidden') {
                        this.sseClient?.disconnect()
                        this.streamState = 'idle'
                    }
                }
                document.addEventListener('visibilitychange', handler)
                    ; (window as any)._c_visibility_handler = handler
            }

            this.sseClient = createSseClient({
                url: buildApiUrl(API_ROUTES.CUSTOMER.ENTRY_EVENTS()),
                withCredentials: true,
                onOpen: () => {
                    this.streamState = 'open'
                    this.error = null
                },
                onError: (e) => {
                    this.streamState = 'error'
                    if (e.status === 404 || e.status === 410) {
                        this.clearEntry()
                    }
                },
                events: {
                    [CUSTOMER_EVENTS.ENTRY_INIT]: (payload: any) => {
                        if (payload) {
                            this.setEntry({
                                id: payload.id,
                                queueId: payload.queueId,
                                ticketNo: payload.ticketNo,
                                position: payload.position,
                                name: payload.name,
                                email: payload.email,
                                phone: payload.phone,
                                partySize: payload.partySize,
                                status: payload.status,
                                servedAt: payload.servedAt,
                                finishedAt: payload.finishedAt,
                                createdAt: payload.createdAt,
                                updatedAt: payload.updatedAt
                            } as Entry)
                        }
                    },
                    [CUSTOMER_EVENTS.POSITION_UPDATE]: (payload: any) => {
                        if (payload?.position != null) {
                            this.position = payload.position
                            if (this.entry) {
                                this.entry.position = payload.position
                            }
                        }
                    },
                    [CUSTOMER_EVENTS.ENTRY_STATUS_CHANGED]: (payload: any) => {
                        console.log('Entry status changed', payload)
                        if (this.entry && payload?.data?.status) {
                            this.entry = { ...this.entry, status: payload.data.status }
                        }
                    },
                },
            })

            this.streamState = 'connecting'
            this.sseClient.connect()
        },

        disconnectLiveUpdates() {
            this.sseClient?.disconnect()
            this.sseClient = null
            this.connectedEntryId = null
            this.streamState = 'idle'

            if ((window as any)._c_visibility_handler) {
                document.removeEventListener('visibilitychange', (window as any)._c_visibility_handler)
                delete (window as any)._c_visibility_handler
            }
        },

        async confirmArrival() {
            if (!this.entry) return false
            this.isLoading = true
            try {
                const result = await CustomerActions.confirmArrival()
                return result.success
            } catch (e: any) {
                this.error = 'Failed to confirm arrival'
                return false
            } finally {
                this.isLoading = false
            }
        },

        async submitRating(rating: number) {
            if (!this.entry) return false
            this.isLoading = true
            try {
                const result = await CustomerActions.submitRating(rating)
                return result.success
            } catch (e: any) {
                this.error = 'Failed to submit rating'
                return false
            } finally {
                this.isLoading = false
            }
        },

        async leaveQueue(): Promise<boolean> {
            try {
                const result = await CustomerActions.leaveQueue()
                this.clearEntry()
                return result.success
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to leave queue'
                return false
            }
        },

        async attemptSessionRecovery(): Promise<boolean> {
            this.isLoading = true
            try {
                const result = await CustomerActions.recoverGuestSession()
                if (result) {
                    this.setEntry(result)
                    this.connectToEvents(result.id)
                    return true
                }
                return false
            } catch (e) {
                return false
            } finally {
                this.isLoading = false
            }
        },

        async updateEntry(payload: { name?: string, email?: string, partySize?: number }): Promise<boolean> {
            try {
                const result = await CustomerActions.updateEntry(payload)
                if (result.success) {
                    if (this.entry) {
                        if (payload.name) this.entry.name = payload.name
                        if (payload.email) this.entry.email = payload.email
                        if (payload.partySize) this.entry.partySize = payload.partySize
                    }
                }
                return result.success
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to update entry'
                return false
            }
        },

        async confirmStillHere(): Promise<boolean> {
            if (!this.entry?.id) return false
            try {
                const result = await CustomerActions.confirmStillHere()
                return result.success
            } catch (e: any) {
                this.error = e?.response?.data?.message || 'Failed to confirm status'
                return false
            }
        },

        clearEntry() {
            this.disconnectLiveUpdates()
            this.entry = null
            this.position = null
            this.error = null
        },
    },
    persist: {
        pick: ['entry', 'position', 'connectedEntryId']
    },

})

