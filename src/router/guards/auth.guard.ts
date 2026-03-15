/**
 * @guard authGuard
 * @description Protects all host app routes. Redirects to /login
 * if no authenticated session exists, preserving the intended destination
 * in the redirect query param.
 *
 * @param {RouteLocationNormalized} to
 * @returns {RouteLocationRaw | undefined}
 */
import { useAuthStore } from '@/stores/auth.store'
import type { NavigationGuardWithThis } from 'vue-router'

export const authGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const auth = useAuthStore()

  if (!auth.isHydrated) {
    await auth.initializeSession()
  }

  if (!auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  void auth
  void to
}
