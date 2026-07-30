import { defineStore } from 'pinia'

import { API_ROUTES, buildApiUrl } from '@/config/api.constants'
import { createSseClient } from '@/lib/sse'
import * as CustomerActions from '@/modules/customer/actions/customer.action'
import type { Entry, JoinQueuePayload } from '@/modules/customer/types'
import router from '@/router'
import { useNotificationStore } from '@/stores/notification.store'
import { useQueueStore } from '@/stores/queue.store'
import { ApiError } from '@/utils/api-response'
import { formatTicketNumber } from '@/utils/format'

import { CUSTOMER_EVENTS } from '../events'

const CUSTOMER_FCM_TOKEN_KEY = 'queuebuzz_customer_fcm_token'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    entry: null,
    position: null,
    headsUpPosition: null,
    isLoading: false,
    error: null,
    errorCode: null,
    streamState: 'idle',
    connectedEntryId: null,
    sseClient: null,
    isConnectionLost: false,
  }),

  getters: {
    isJoined: (state) => {
      if (!state.entry) return false
      const activeStatuses = ['WAITING', 'CALLED', 'IDLE', 'ARRIVED']
      return activeStatuses.includes(state.entry.status)
    },
    entryId: (state) => state.entry?.id ?? null,
    status: (state) => state.entry?.status ?? null,
    ahead: (state) => (state.position == null ? null : Math.max(0, state.position - 1)),
    estWaitMin: (state) => {
      const position = state.position
      if (position == null) return null
      const ahead = Math.max(0, position - 1)
      const activeQueue = useQueueStore().activeQueue
      const avgServiceMins = activeQueue?.avgServiceMins ?? 0
      const bufferMins = activeQueue?.bufferMins ?? 0
      return ahead * avgServiceMins + bufferMins
    },
    isStreamConnected: (state) => state.streamState === 'open',
  },

  actions: {
    addCustomerNotification(
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

    setEntry(e: Partial<Entry>) {
      const eObj = e as Record<string, unknown>
      const verifyCode = (e.verifyCode || eObj.verify_code || this.entry?.verifyCode) as
        string | undefined
      this.entry = {
        ...this.entry,
        ...e,
        verifyCode,
        ticketNumber:
          ((e.ticketNo || eObj.ticket_no || this.entry?.ticketNo) as number)?.toString() ||
          this.entry?.ticketNumber,
        position: (e.position ?? this.position ?? undefined) as number | undefined,
      } as Entry
      if (e.position != null) {
        this.position = e.position as number
      }
    },

    getPushTokenStorageKey(entryId?: string | null) {
      return entryId ? `${CUSTOMER_FCM_TOKEN_KEY}:${entryId}` : null
    },

    rememberPushToken(token: string, entryId?: string | null) {
      if (globalThis.globalThis === undefined) {
        return
      }

      const key = this.getPushTokenStorageKey(entryId || this.entry?.id)
      if (!key) {
        return
      }

      globalThis.localStorage.setItem(key, token)
    },

    clearRememberedPushToken(entryId?: string | null) {
      if (typeof globalThis === 'undefined') {
        return
      }

      const key = this.getPushTokenStorageKey(entryId || this.entry?.id)
      if (!key) {
        return
      }

      globalThis.localStorage.removeItem(key)
    },

    getDisplayTicketNumber(entry?: Entry | null) {
      if (!entry) {
        return ''
      }

      if (typeof entry.ticketNo === 'number' && Number.isFinite(entry.ticketNo)) {
        return formatTicketNumber(entry.ticketNo)
      }

      return entry.id?.substring(0, 4).toUpperCase() || ''
    },

    async syncPushToken(): Promise<boolean> {
      if (!this.entry?.id || typeof globalThis === 'undefined' || !('Notification' in globalThis)) {
        return false
      }

      if (Notification.permission !== 'granted') {
        return false
      }

      try {
        const { getFCMTokenDetails } = await import('@/lib/firebase')
        const { token, reason, detail } = await getFCMTokenDetails()
        if (!token) {
          // eslint-disable-next-line no-console
          console.warn('Customer FCM sync skipped:', reason, detail)
          return false
        }

        const tokenKey = this.getPushTokenStorageKey(this.entry.id)
        if (!tokenKey) {
          return false
        }

        if (globalThis.localStorage.getItem(tokenKey) === token) {
          return true
        }

        const result = await CustomerActions.updateEntry({ fcmToken: token })
        if (result.success) {
          this.rememberPushToken(token, this.entry.id)
        }

        return result.success
      } catch {
        return false
      }
    },

    async joinQueue(queueId: string, payload: JoinQueuePayload): Promise<Entry | null> {
      this.isLoading = true
      this.error = null
      this.errorCode = null
      try {
        const result = await CustomerActions.joinQueue(queueId, payload)
        this.setEntry(result)

        if (payload.fcmToken) {
          this.rememberPushToken(payload.fcmToken, result.id)
        } else {
          await this.syncPushToken()
        }

        return result
      } catch (e: unknown) {
        const err = e as ApiError
        this.error =
          err?.response?.data?.message || err?.response?.data?.error || 'Failed to join queue'
        this.errorCode = err?.response?.data?.code || null
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchEntry(): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        const result = await CustomerActions.fetchEntry()
        if (result) {
          this.setEntry(result)
          await this.syncPushToken()
        }
      } catch (e: unknown) {
        const err = e as ApiError
        if (
          err?.response?.status === 401 ||
          err?.response?.status === 410 ||
          err?.response?.status === 404
        ) {
          this.clearEntry()
        } else {
          this.error = err?.response?.data?.message || 'Failed to fetch status'
        }
      } finally {
        this.isLoading = false
      }
    },

    async revalidate(entryId: string) {
      if (!entryId) return

      if (
        this.entry?.id === entryId &&
        (this.streamState === 'open' || this.streamState === 'connecting')
      ) {
        this.connectToEvents(entryId)
        return
      }

      try {
        await this.fetchEntry()
        if (this.entry?.id) {
          this.connectToEvents(this.entry.id)
        }
      } catch (err: unknown) {
        const e = err as ApiError
        if (e.response?.status === 404 || e.response?.status === 410) {
          this.clearEntry()
        }
      }
    },

    connectToEvents(entryId: string) {
      if (
        this.sseClient &&
        this.connectedEntryId === entryId &&
        (this.streamState === 'open' || this.streamState === 'connecting')
      ) {
        return
      }

      this.connectedEntryId = entryId

      // Visibility Listener to suspend/resume connection to save battery/network
      if (!(globalThis as unknown as { _c_visibility_handler: () => void })._c_visibility_handler) {
        const handler = () => {
          const id = this.connectedEntryId
          if (!id) return

          if (document.visibilityState === 'visible') {
            this.revalidate(id)
          } else if (document.visibilityState === 'hidden') {
            // When background keep-alive is active (customer waiting/called views),
            // skip SSE disconnect — the tab won't be suspended and we need
            // real-time status updates to trigger in-page alerts
            if (globalThis.__qb_keepalive_active) return

            this.sseClient?.disconnect()
            this.streamState = 'idle'
          }
        }
        document.addEventListener('visibilitychange', handler)
        ;(globalThis as unknown as { _c_visibility_handler: () => void })._c_visibility_handler =
          handler
      }

      this.sseClient = createSseClient({
        url: buildApiUrl(API_ROUTES.CUSTOMER.ENTRY_EVENTS()),
        withCredentials: true,
        onOpen: () => {
          this.streamState = 'open'
          this.isConnectionLost = false
          this.error = null
        },
        onError: (e) => {
          this.streamState = 'error'
          if (e.status === 404 || e.status === 410) {
            this.clearEntry()
          } else if (!e.status) {
            // Network failure — SSE client will retry, but flag for UI
            this.isConnectionLost = true
          }
        },
        events: {
          [CUSTOMER_EVENTS.ENTRY_INIT]: (payload: Record<string, unknown>) => {
            if (payload) {
              this.setEntry(payload)
            }
          },
          [CUSTOMER_EVENTS.POSITION_UPDATE]: (payload: { data?: { position?: number } }) => {
            const pos = payload?.data?.position
            if (pos != null) {
              const previousPosition = this.position
              this.position = pos
              if (this.entry) {
                this.entry.position = pos
              }

              if (
                previousPosition != null &&
                pos < previousPosition &&
                document.visibilityState === 'visible'
              ) {
                this.addCustomerNotification(
                  'Queue Update',
                  `You are now number ${pos} in the queue.`,
                  'info',
                  `customer-position-${entryId}-${pos}`,
                )
              }
            }
          },
          [CUSTOMER_EVENTS.ENTRY_STATUS_CHANGED]: (payload: { data?: { status?: string } }) => {
            if (this.entry && payload?.data?.status) {
              const nextStatus = payload.data.status.toUpperCase()
              this.entry = { ...this.entry, status: payload.data.status }

              if (nextStatus === 'CALLED') {
                this.addCustomerNotification(
                  "It's your turn!",
                  'Please head to the counter now.',
                  'success',
                  `customer-called-${entryId}`,
                )
              } else if (nextStatus === 'IDLE') {
                this.addCustomerNotification(
                  'Still with us?',
                  'Please confirm you are still here to keep your place.',
                  'warning',
                  `customer-idle-${entryId}`,
                )
              }
            }
          },
          [CUSTOMER_EVENTS.PUSH_TOKEN_REFRESH_REQUIRED]: async () => {
            const refreshed = await this.syncPushToken()
            if (refreshed) {
              this.addCustomerNotification(
                'Notifications Restored',
                'Your device notification token was refreshed automatically.',
                'success',
                `customer-token-refresh-${entryId}`,
              )
            }
          },
          [CUSTOMER_EVENTS.HEADS_UP]: (payload: { data?: { position?: number } }) => {
            const pos = payload?.data?.position
            if (pos == null) return

            const title = pos === 2 ? "You're next!" : 'Almost your turn!'
            const body =
              pos === 2
                ? "Get ready — you're second in line. Start heading over now."
                : "Heads up — you're third in line. Your turn is coming up soon."

            this.headsUpPosition = pos
            this.addCustomerNotification(title, body, 'info', `customer-heads-up-${entryId}-${pos}`)
          },
          [CUSTOMER_EVENTS.QUEUE_ENDED]: () => {
            this.onGlobalQueueEnd()
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

      if ((globalThis as unknown as { _c_visibility_handler: () => void })._c_visibility_handler) {
        document.removeEventListener(
          'visibilitychange',
          (globalThis as unknown as { _c_visibility_handler: () => void })._c_visibility_handler,
        )
        delete (globalThis as unknown as { _c_visibility_handler?: () => void })
          ._c_visibility_handler
      }
    },

    async confirmArrival() {
      if (!this.entry) return false
      this.isLoading = true
      this.error = null
      try {
        const result = await CustomerActions.confirmArrival()
        return result.success
      } catch (e: unknown) {
        const err = e as ApiError
        if (err?.response?.status === 410 || err?.response?.status === 404) {
          this.onGlobalQueueEnd()
          return false
        }
        this.error = 'Failed to confirm arrival'
        return false
      } finally {
        this.isLoading = false
      }
    },
    async finishService() {
      if (!this.entry) return false
      this.isLoading = true
      this.error = null
      try {
        const result = await CustomerActions.finishService()
        if (result.success) {
          this.resetCustomerSession()
        }
        return result.success
      } catch (e: unknown) {
        const err = e as ApiError
        if (err?.response?.status === 410 || err?.response?.status === 404) {
          this.onGlobalQueueEnd()
          return false
        }
        this.error = 'Failed to finish service'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async submitRating(rating: number) {
      if (!this.entry) return false
      this.isLoading = true
      this.error = null
      try {
        const result = await CustomerActions.submitRating(rating)
        return result.success
      } catch {
        this.error = 'Failed to submit rating'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async leaveQueue(): Promise<boolean> {
      this.isLoading = true
      this.error = null
      try {
        const result = await CustomerActions.leaveQueue()
        if (result.success) {
          this.resetCustomerSession()
        }
        return result.success
      } catch (e: unknown) {
        const err = e as ApiError
        if (
          err?.response?.status === 401 ||
          err?.response?.status === 410 ||
          err?.response?.status === 404
        ) {
          this.resetCustomerSession()
          return true
        }
        this.error = err?.response?.data?.message || 'Failed to leave queue'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async attemptSessionRecovery(): Promise<boolean> {
      this.isLoading = true
      this.error = null
      try {
        let result = null
        let queryToken: string | null = null

        // 1. Check if there is a recovery token in the URL query params
        if (typeof globalThis !== 'undefined' && globalThis.location) {
          const urlParams = new URLSearchParams(globalThis.location.search)
          queryToken = urlParams.get('recovery_token') || urlParams.get('token')
        }

        // 2. Check CacheStorage as a shared storage fallback (specifically for iOS Safari -> PWA transfer)
        if (!queryToken && typeof globalThis !== 'undefined' && 'caches' in globalThis) {
          try {
            const cache = await globalThis.caches.open('queuebuzz-session')
            const response = await cache.match('/pwa-recovery-session-token')
            if (response) {
              const data = await response.json()
              queryToken = data.token || null
            }
          } catch {
            // Fail silently
          }
        }

        if (queryToken) {
          result = await CustomerActions.recoverGuestSessionByToken(queryToken)
          // Clean up query parameters & CacheStorage immediately after successful recovery
          if (result) {
            if (typeof globalThis !== 'undefined' && globalThis.location) {
              const url = new URL(globalThis.location.href)
              url.searchParams.delete('recovery_token')
              url.searchParams.delete('token')
              globalThis.history.replaceState({}, '', url.toString())
            }
            if (typeof globalThis !== 'undefined' && 'caches' in globalThis) {
              try {
                const cache = await globalThis.caches.open('queuebuzz-session')
                await cache.delete('/pwa-recovery-session-token')
              } catch {
                // Fail silently
              }
            }
          }
        }

        if (!result) {
          result = await CustomerActions.recoverGuestSession()
        }

        if (result) {
          this.setEntry(result)
          await this.syncPushToken()
          this.connectToEvents(result.id)
          return true
        }
        return false
      } catch {
        return false
      } finally {
        this.isLoading = false
      }
    },
    async recoverGuestSessionByToken(token: string): Promise<boolean> {
      this.isLoading = true
      this.error = null
      try {
        const result = await CustomerActions.recoverGuestSessionByToken(token)
        if (result) {
          this.setEntry(result)
          await this.syncPushToken()
          this.connectToEvents(result.id)
          return true
        }
        return false
      } catch (e: unknown) {
        const err = e as ApiError
        this.error = err?.response?.data?.message || 'Failed to recover guest session'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async updateEntry(payload: {
      name?: string
      email?: string
      phone?: string
      partySize?: number
      fcmToken?: string
    }): Promise<boolean> {
      this.isLoading = true
      this.error = null
      try {
        const result = await CustomerActions.updateEntry(payload)
        if (result.success) {
          if (this.entry) {
            Object.assign(this.entry, {
              ...(payload.name && { name: payload.name }),
              ...(payload.email && { email: payload.email }),
              ...(payload.phone !== undefined && { phone: payload.phone }),
              ...(payload.partySize && { partySize: payload.partySize }),
            })
          }

          const canRememberToken =
            payload.fcmToken && this.entry?.id && typeof globalThis !== 'undefined'
          if (canRememberToken) {
            this.rememberPushToken(payload.fcmToken, this.entry!.id)
          }
        }
        return result.success
      } catch (e: unknown) {
        const err = e as ApiError
        this.error = err?.response?.data?.message || 'Failed to update entry'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async confirmStillHere(): Promise<boolean> {
      if (!this.entry?.id) return false
      this.isLoading = true
      this.error = null
      try {
        const result = await CustomerActions.confirmStillHere()
        return result.success
      } catch (e: unknown) {
        const err = e as ApiError
        if (err?.response?.status === 410 || err?.response?.status === 404) {
          this.onGlobalQueueEnd()
          return false
        }
        this.error = err?.response?.data?.message || 'Failed to confirm status'
        return false
      } finally {
        this.isLoading = false
      }
    },

    onGlobalQueueEnd() {
      if (!this.entry) return
      const queueId = useQueueStore().activeQueue?.id || ''
      this.clearEntry()
      router.replace({
        name: 'customer-ended',
        params: { queueId },
        query: { reason: 'terminated' },
      })
    },

    resetCustomerSession() {
      const entryId = this.entry?.id
      this.disconnectLiveUpdates()
      this.clearRememberedPushToken(entryId)
      useNotificationStore().clearNotifications()
      this.entry = null
      this.position = null
      this.headsUpPosition = null
      this.error = null
      this.errorCode = null
      this.isConnectionLost = false
    },

    clearEntry() {
      this.resetCustomerSession()
    },
  },
  persist: {
    pick: ['entry', 'position', 'connectedEntryId'],
  },
})
