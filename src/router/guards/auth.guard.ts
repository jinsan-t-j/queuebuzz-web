/**
 * @guard authGuard
 * @description Protects all host app routes. Redirects to /login
 * if no authenticated session exists, preserving the intended destination
 * in the redirect query param.
 *
 * @param {RouteLocationNormalized} to
 * @returns {RouteLocationRaw | undefined}
 */
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth.store'
import { useQueueStore } from '@/stores/queue.store'
import type { NavigationGuardWithThis } from 'vue-router'

export const authGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const auth = useAuthStore()
  const { showToast } = useToast()

  if (!auth.isHydrated) {
    await auth.initializeSession()
    if (auth.error) {
      await auth.logout()
      showToast(auth.error.message, { type: 'error' })
    }
    if (auth.isAuthenticated) {
      const queueStore = useQueueStore()
      void queueStore.fetchActiveQueue()
    }
  }

  if (!auth.isAuthenticated) {
    return { path: '/login-or-signup', query: { redirect: to.fullPath } }
  }

  void auth
  void to
}
