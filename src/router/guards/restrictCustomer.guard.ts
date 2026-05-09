/**
 * @guard restrictCustomerGuard
 * @description Ensures customer sessions are recovered and validated
 * before entering join or waiting flows.
 */
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import type { NavigationGuardWithThis } from 'vue-router'

export const restrictCustomerGuard: NavigationGuardWithThis<undefined> = async () => {
  const customer = useCustomerStore()

  if (customer.isJoined) {
    await customer.fetchEntry()
  } else {
    await customer.attemptSessionRecovery()
  }
}
