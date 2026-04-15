/**
 * @guard restrictActiveHostGuard
 * @description Prevents hosts from accessing the "Create Queue" page
 * if they already have an active queue session.
 */
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'
import type { NavigationGuardWithThis } from 'vue-router'

export const restrictActiveHostGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const queueStore = useQueueStore()
  const { showToast } = useToast()

  const activeQueue = await queueStore.fetchActiveQueue()

  if (activeQueue?.id) {
    const isManageable = ['active', 'paused'].includes(activeQueue.status.toLowerCase())

    if (isManageable) {
      showToast('Redirecting to your active queue...', { type: 'info', duration: 2500 })

      if (to.name?.toString().startsWith('guest-host')) {
        return {
          name: 'guest-host-live-queue',
          params: { id: activeQueue.id },
        }
      }
      return { name: 'dashboard' }
    }

    queueStore.clearQueue()
  }
}
