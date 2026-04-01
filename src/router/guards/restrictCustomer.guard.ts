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

  // 1. If we don't have an entry in store, try to recover from cookie
  if (!customer.isJoined) {
    await customer.attemptSessionRecovery()
  }

  // 2. If they are now joined (either from store or recovery), check their status
  if (customer.isJoined && customer.entry?.id) {
    const status = customer.entry.status
    const queueId = customer.entry.queueId

    // If they are specifically waiting, called, or idle - keep them in that session
    if (['WAITING', 'CALLED', 'IDLE'].includes(status)) {
      showToast('Welcome back! Redirecting to your active queue.', { type: 'info', duration: 2500 })
      
      const routeName = status === 'CALLED' ? 'customer-called' : 
                       status === 'IDLE' ? 'customer-idle' : 
                       'customer-waiting'
      
      return { 
        name: routeName, 
        params: { queueId } 
      }
    }
  }
}
