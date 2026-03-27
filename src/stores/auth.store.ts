import { defineStore } from 'pinia'
import { fetchCurrentHost, logoutHost } from '@/modules/app/auth/actions/auth.actions'
import type { AuthUser } from '@/modules/app/auth/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    isHydrated: false,
    activeGuestQueueId: null as string | null, // Lightweight flag for anonymous hosts
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    isPremium: (state) => state.user?.tier === 'premium',
  },

  actions: {
    setUser(userData: AuthUser) {
      this.user = userData
      this.activeGuestQueueId = null // Clear guest status if they become a registered host
    },

    setGuestSession(queueId: string | null) {
      this.activeGuestQueueId = queueId
    },

    async logout() {
      try {
        await logoutHost()
      } finally {
        this.user = null
        this.activeGuestQueueId = null
      }
    },

    async initializeSession() {
      try {
        this.user = await fetchCurrentHost()
      } catch {
        this.user = null
      } finally {
        this.isHydrated = true
      }
    },
  },
  persist: true,
})
