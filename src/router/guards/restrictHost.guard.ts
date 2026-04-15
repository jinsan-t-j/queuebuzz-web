/**
 * @guard restrictHostGuard
 * @description Prevents both registered and anonymous hosts from accessing
 * customer-facing routes. Redirects them back to their respective
 * host management views.
 */
import { useAuthStore } from '@/stores/auth.store'
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'
import type { NavigationGuardWithThis } from 'vue-router'

export const restrictHostGuard: NavigationGuardWithThis<undefined> = async () => {
  const auth = useAuthStore()
  const queueStore = useQueueStore()
  const { showToast } = useToast()

  if (auth.isAuthenticated) {
    const activeQueue = await queueStore.fetchActiveQueue()
    if (activeQueue && ['active', 'paused'].includes(activeQueue.status.toLowerCase())) {
      showToast('You must finish managing your active queue first.', {
        type: 'info',
        duration: 3500,
      })
      return { name: 'dashboard' }
    }
  }

  if (auth.activeGuestQueueId) {
    const activeQueue = await queueStore.fetchActiveQueue()
    if (activeQueue && ['active', 'paused'].includes(activeQueue.status.toLowerCase())) {
      showToast('You must finish managing your active queue first.', {
        type: 'info',
        duration: 3500,
      })
      return {
        name: 'guest-host-live-queue',
        params: { id: auth.activeGuestQueueId },
      }
    }
  }
}
