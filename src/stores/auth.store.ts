import { defineStore } from 'pinia'
import { fetchCurrentHost, logoutHost } from '@/modules/app/auth/actions/auth.actions'
import type { AuthUser } from '@/modules/app/auth/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    isHydrated: false,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    isPremium: (state) => state.user?.tier === 'premium',
  },

  actions: {
    setUser(userData: AuthUser) {
      this.user = userData
    },

    async logout() {
      try {
        await logoutHost()
      } finally {
        this.user = null
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
