/**
 * Slug validation rules and constants.
 * Synchronized with backend implementation.
 */

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/

export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'billing',
  'checkout',
  'dashboard',
  'guest-host',
  'help',
  'history',
  'join',
  'login',
  'pricing',
  'queue',
  'recover',
  'settings',
  'signup',
  'support',
  'terms',
  'privacy',
  'status',
  'waiting',
])

export const SLUG_VALIDATION_ERROR = 'must be 3-30 lowercase alphanumeric characters or hyphens'

/**
 * Validates slug format.
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug.toLowerCase().trim())
}

/**
 * Checks if a slug is in the reserved list.
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase().trim())
}
