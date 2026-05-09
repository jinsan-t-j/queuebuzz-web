/**
 * @guard billingGuard
 * @description Prevents access to premium features based on the host's current plan.
 */
import { useBilling } from '@/modules/app/billing/composables/useBilling'
import { useAuthStore } from '@/stores/auth.store'

import type { NavigationGuardWithThis } from 'vue-router'

export const billingGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const auth = useAuthStore()

  // Only apply to authenticated host routes
  if (!auth.isAuthenticated) {
    return
  }

  const { fetchCurrentPlan } = useBilling()
  const plan = await fetchCurrentPlan()

  if (!plan) return

  // Check for specific features required by the route
  const requiredFeature = to.meta?.requiredFeature as string

  if (requiredFeature === 'history_detail' && !plan.limits.historyAccess) {
    return {
      name: 'system-error',
      query: {
        title: 'Premium Feature',
        description:
          'Detailed history is only available on Premium plans. Upgrade now to unlock insights!',
        action_text: 'View Plans',
        action_path: '/dashboard/settings?tab=billing',
      },
    }
  }
}
