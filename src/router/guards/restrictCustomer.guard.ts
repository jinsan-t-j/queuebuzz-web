/**
 * @guard restrictCustomerGuard
 * @description Prevents active customers from accessing the join flow
 * or host login. Redirects them back to their current queue experience.
 */
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useToast } from '@/composables/useToast'
import type { NavigationGuardWithThis } from 'vue-router'

export const restrictCustomerGuard: NavigationGuardWithThis<undefined> = async () => {
  const customer = useCustomerStore()
  const { showToast } = useToast()

  if (customer.isJoined) {
    await customer.fetchEntry()
  } else {
    await customer.attemptSessionRecovery()
  }

  if (customer.isJoined && customer.entry?.id) {
    const status = customer.entry.status
    const activeQueueId = customer.entry.queueId

    if (['WAITING', 'CALLED', 'IDLE'].includes(status)) {
      showToast('Welcome back! Redirecting to your active queue.', { type: 'info', duration: 2500 })

      let routeName = 'customer-waiting'
      if (status === 'CALLED') {
        routeName = 'customer-called'
      } else if (status === 'IDLE') {
        routeName = 'customer-idle'
      }

      return {
        name: routeName,
        params: { queueId: activeQueueId },
      }
    }
  }
}
