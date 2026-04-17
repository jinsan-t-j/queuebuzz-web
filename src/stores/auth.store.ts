import { defineStore } from 'pinia'
import { fetchCurrentHost, logoutHost } from '@/modules/app/auth/actions/auth.actions'
import type { AuthUser } from '@/modules/app/auth/types'

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
        this.clearSession()
      }
    },

    async initializeSession() {
      try {
        this.user = await fetchCurrentHost()
        this.isHydrated = true
      } catch (error) {
        this.user = null
        this.error = error as Error
      }
    },

    clearSession() {
      this.user = null
      this.activeGuestQueueId = null
      this.isHydrated = false
    },
  },
  persist: {
    pick: ['user', 'activeGuestQueueId'],
  },
})
