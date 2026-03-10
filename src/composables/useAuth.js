/**
 * @composable useAuth
 * @description Provides authentication actions and state for components.
 * Wraps the auth store with convenience methods. No real API calls —
 * uses mock data for development.
 */
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

/**
 * @returns {Object} Auth composable with user state and login/logout methods.
 */
export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  const user = computed(() => store.user)
  const isAuthenticated = computed(() => store.isAuthenticated)
  const isPremium = computed(() => store.isPremium)

  /**
   * @description Mock login — sets a demo user in the store.
   * @param {string} email - The email used for login
   */
  function login(email) {
    const mockUser = {
      id: 'usr_001',
      name: 'Alex Rivera',
      email,
      businessName: 'Rivera Barbershop',
      tier: 'free',
      avatar: null,
    }
    store.setUser(mockUser, 'mock-token-abc123')
  }

  /**
   * @description Logs out the user and redirects to home.
   */
  function logout() {
    store.logout()
    router.push({ name: 'home' })
  }

  return { user, isAuthenticated, isPremium, login, logout }
}
