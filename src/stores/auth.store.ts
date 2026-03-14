/**
 * @store authStore
 * @description Global authentication state. Source of truth for current
 * host session. Consumed by router guards, AppLayout, and TheTopbar.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '@/modules/app/auth/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isPremium = computed(() => user.value?.tier === 'premium')

  // Actions
  /**
   * @description Sets the authenticated user and token.
   * @param {Object} userData - The user profile object.
   * @param {string} authToken - The session token.
   */
  function setUser(userData: AuthUser, authToken: string) {
    user.value = userData
    token.value = authToken
  }

  /**
   * @description Clears user session from memory.
   */
  function logout() {
    user.value = null
    token.value = null
  }

  return { user, token, isAuthenticated, isPremium, setUser, logout }
})
