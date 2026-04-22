import { defineStore } from 'pinia'
import { fetchDashboard as apiFetch } from '@/modules/app/dashboard/actions/dashboard.actions'
import type { DashboardData } from '@/modules/app/dashboard/types'
import { getErrorMessage } from '@/utils/api-response'

/**
 * @store dashboardStore
 * @description Manages dashboard metrics with smart caching and persistence.
 * Patterns aligned with Queue and Auth stores for consistency across the app.
 */
export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    data: null as DashboardData | null,
    isLoading: false,
    isRefreshing: false,
    error: null as string | null,
    lastFetched: null as number | null,
    isDirty: true,
  }),

  getters: {
    hasData: (state) => !!state.data,
    cacheAge: (state) => {
      if (!state.lastFetched) return Infinity
      return Date.now() - state.lastFetched
    },
    isStale: (state) => state.isDirty || Date.now() - (state.lastFetched || 0) > 300000, // 5 mins
  },

  actions: {
    setDirty() {
      this.isDirty = true
    },

    /**
     * Fetches dashboard data.
     * @param options.force - Skip cache check and fetch fresh data.
     * @param options.silent - Update data without triggering the global isLoading state (prevents skeletons).
     */
    async fetchDashboard(options: { force?: boolean; silent?: boolean } = {}) {
      const { force = false, silent = false } = options

      if (!force && !this.isDirty && this.data) {
        return this.data
      }

      if (silent) {
        this.isRefreshing = true
      } else {
        this.isLoading = true
      }

      this.error = null

      try {
        const result = await apiFetch()
        this.data = result
        this.lastFetched = Date.now()
        this.isDirty = false
        return result
      } catch (e: unknown) {
        this.error = getErrorMessage(e, 'Failed to load dashboard statistics')
        return null
      } finally {
        this.isLoading = false
        this.isRefreshing = false
      }
    },

    /**
     * Resets the store state.
     */
    reset() {
      this.data = null
      this.isLoading = false
      this.error = null
      this.lastFetched = null
      this.isDirty = true
    },
  },

  persist: {
    pick: ['data', 'lastFetched', 'isDirty'],
  },
})
