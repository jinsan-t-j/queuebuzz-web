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

  let activeQueue = queueStore.activeQueue

  if (!activeQueue) {
    activeQueue = await queueStore.fetchActiveQueue()
  }

  if (activeQueue?.id) {
    showToast('You already have an active queue. Redirecting...', { type: 'info', duration: 2500 })

    // Anonymous flow redirect
    if (to.name?.toString().startsWith('guest-host')) {
      return {
        name: 'guest-host-live-queue',
        params: { id: activeQueue.id }
      }
    }

    // Authenticated flow redirect
    return { name: 'dashboard' }
  }

  // 3. No active queue found, proceed to creation form
}
