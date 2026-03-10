/**
 * @guard guestGuard
 * @description Prevents already-authenticated hosts from accessing
 * login or signup pages. Redirects to /dashboard.
 *
 * @returns {RouteLocationRaw | undefined}
 */
import { useAuthStore } from '@/stores/auth.store'

export function guestGuard() {
  const auth = useAuthStore()
  if (auth.isAuthenticated) {
    return { path: '/dashboard' }
  }
}
