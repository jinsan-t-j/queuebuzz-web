import { fetchCurrentHost, logoutHost } from '@/modules/app/auth/actions/auth.actions'
import type { AuthUser } from '@/modules/app/auth/types'
import { defineStore } from 'pinia'
import { useDashboardStore } from './dashboard.store'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    isHydrated: false,
    activeGuestQueueId: null as string | null,
    error: null as Error | null,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    isPremium: (state) => state.user?.tier === 'premium',
  },

  actions: {
    setUser(userData: AuthUser) {
      this.user = userData
      this.activeGuestQueueId = null
    },

    setGuestSession(queueId: string | null) {
      this.activeGuestQueueId = queueId
    },

    async logout() {
      try {
        await logoutHost()
      } finally {
        useDashboardStore().reset()
        this.clearSession()
      }
    },

    async initializeSession(options?: { skipLogout?: boolean }) {
      try {
        this.user = await fetchCurrentHost(options)
      } catch (error) {
        this.user = null
        this.error = error as Error
      } finally {
        this.isHydrated = true
      }
    },

    clearSession() {
      this.user = null
      this.activeGuestQueueId = null
      // We keep isHydrated = true because we know the session is empty
      this.isHydrated = true
    },
  },
  persist: {
    pick: ['user', 'activeGuestQueueId'],
  },
})
