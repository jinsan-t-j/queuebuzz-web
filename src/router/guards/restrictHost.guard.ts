/**
 * @guard restrictHostGuard
 * @description Prevents both registered and anonymous hosts from accessing
 * customer-facing routes. Redirects them back to their respective
 * host management views.
 */
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/useToast'
import type { NavigationGuardWithThis } from 'vue-router'

export const restrictHostGuard: NavigationGuardWithThis<undefined> = () => {
  const auth = useAuthStore()
  const { showToast } = useToast()

  if (auth.isAuthenticated) {
    showToast('Access Denied. You are managing a live queue', { type: 'info', duration: 3500 })
    return { name: 'dashboard' }
  }

  if (auth.activeGuestQueueId) {
    showToast('Access Denied. You are managing a live queue.', { type: 'info', duration: 3500 })
    return {
      name: 'guest-host-live-queue',
      params: { id: auth.activeGuestQueueId }
    }
  }
}
