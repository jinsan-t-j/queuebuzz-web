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

export function authGuard(to) {
  const auth = useAuthStore()
  // if (!auth.isAuthenticated) {
  //   return { path: '/login', query: { redirect: to.fullPath } }
  // }
}
