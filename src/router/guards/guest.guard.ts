/**
 * @guard guestGuard
 * @description Prevents already-authenticated hosts from accessing
 * login or signup pages. Redirects to /dashboard.
 *
 * @returns {RouteLocationRaw | undefined}
 */
import { useAuthStore } from '@/stores/auth.store'
import type { NavigationGuardWithThis } from 'vue-router'

export const guestGuard: NavigationGuardWithThis<undefined> = () => {
  const auth = useAuthStore()
  if (auth.isAuthenticated) {
    return { path: '/dashboard' }
  }
}
