/**
 * @guard restrictActiveHostGuard
 * @description Prevents hosts from accessing restricted routes (like Create Queue
 * or Customer views) if they already have an active queue session.
 * Redirects them back to their respective management view.
 */

import { useToast } from '@/composables/useToast'

import type { NavigationGuardWithThis } from 'vue-router'

export const restrictActiveHostGuard: NavigationGuardWithThis<undefined> = async () => {
  const { useAuthStore } = await import('@/stores/auth.store')
  const auth = useAuthStore()

  if (!auth.isAuthenticated && !auth.anonymousQueueId) {
    return
  }

  const { useQueueStore } = await import('@/stores/queue.store')

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

      if (auth.anonymousQueueId) {
        return {
          name: 'guest-host-live-queue',
          params: { id: activeQueue.id },
        }
      }

      return { name: 'dashboard' }
    }

    queueStore.clearQueue()
    const authStore = useAuthStore()
    authStore.clearSession()
  }
}
