/**
 * @store authStore
 * @description Global authentication state. Source of truth for current
 * host session. Consumed by router guards, AppLayout, and TheTopbar.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchCurrentHost, logoutHost } from '@/modules/app/auth/actions/auth.actions'
import type { AuthUser } from '@/modules/app/auth/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const isHydrated = ref(false)

  // Getters
  const isAuthenticated = computed(() => user.value !== null)
  const isPremium = computed(() => user.value?.tier === 'premium')

  // Actions
  /**
   * @description Sets the authenticated user for the current session.
   * @param {Object} userData - The user profile object.
   */
  function setUser(userData: AuthUser) {
    user.value = userData
  }

  /**
   * @description Clears user session from memory.
   */
  async function logout() {
    try {
      await logoutHost()
    } finally {
      user.value = null

    }
  }

  async function initializeSession() {
    try {
      user.value = await fetchCurrentHost()
    } catch {
      user.value = null
    } finally {
      isHydrated.value = true
    }
  }

  return { user, isHydrated, isAuthenticated, isPremium, setUser, logout, initializeSession }
})
