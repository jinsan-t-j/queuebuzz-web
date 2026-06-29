/**
 * @guard authGuard
 * @description Protects all host app routes. Redirects to /login
 * if no authenticated session exists, preserving the intended destination
 * in the redirect query param.
 *
 * @param {RouteLocationNormalized} to
 * @returns {RouteLocationRaw | undefined}
 */

import type { NavigationGuardWithThis } from 'vue-router'

export const authGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const { useAuthStore } = await import('@/stores/auth.store')
  const auth = useAuthStore()

  if (!auth.isHydrated) {
    const { useToast } = await import('@/composables/useToast')
    const { showToast } = useToast()

    await auth.initializeSession({ skipLogout: true })
    if (auth.error) {
      const is401 =
        (auth.error as unknown as { response: { status: number } })?.response?.status === 401
      auth.clearSession()
      if (!is401) {
        showToast(auth.error.message, { type: 'error' })
      }
    }
    if (auth.isAuthenticated) {
      const { useQueueStore } = await import('@/stores/queue.store')
      const queueStore = useQueueStore()
      void queueStore.fetchActiveQueue()
    }
  }

  if (!auth.isAuthenticated) {
    return { path: '/login-or-signup', query: { redirect: to.fullPath } }
  }
}
