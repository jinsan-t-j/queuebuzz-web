/**
 * @guard restrictCustomerGuard
 * @description Prevents active customers from accessing the join flow
 * or host login. Redirects them back to their current queue experience.
 */
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useToast } from '@/composables/useToast'
import type { NavigationGuardWithThis } from 'vue-router'

export const restrictCustomerGuard: NavigationGuardWithThis<undefined> = () => {
  const customer = useCustomerStore()
  const { showToast } = useToast()

  if (customer.isJoined && customer.entry?.id) {
    const status = customer.entry.status
    const queueId = customer.entry.queueId

    // If they are specifically waiting, called, or idle - keep them in that session
    if (['WAITING', 'CALLED', 'IDLE'].includes(status)) {
      showToast('Redirecting to your active queue.', { type: 'info', duration: 3500 })
      
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
