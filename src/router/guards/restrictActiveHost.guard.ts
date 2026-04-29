/**
 * @guard restrictActiveHostGuard
 * @description Prevents hosts from accessing restricted routes (like Create Queue
 * or Customer views) if they already have an active queue session.
 * Redirects them back to their respective management view.
 */
import { useAuthStore } from '@/stores/auth.store'
import type { NavigationGuardWithThis } from 'vue-router'

export const restrictActiveHostGuard: NavigationGuardWithThis<undefined> = async () => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated && !auth.activeGuestQueueId) {
    return
  }

  const { useQueueStore } = await import('@/stores/queue.store')
  const { useToast } = await import('@/composables/useToast')

  const queueStore = useQueueStore()
  const { showToast } = useToast()

  const activeQueue = await queueStore.fetchActiveQueue()

  if (activeQueue?.id) {
    const isManageable = ['active', 'paused'].includes(activeQueue.status.toLowerCase())

    if (isManageable) {
      showToast('You must finish managing your active queue first.', {
        type: 'info',
        duration: 3500,
      })

      if (auth.activeGuestQueueId) {
        return {
          name: 'guest-host-live-queue',
          params: { id: activeQueue.id },
        }
      }

      return { name: 'dashboard' }
    }

    queueStore.clearQueue()
    useAuthStore().clearSession()
  }
}
