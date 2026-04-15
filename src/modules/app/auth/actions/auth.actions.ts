import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type { AuthUser } from '@/modules/app/auth/types'

export interface RegisterHostPayload {
  email?: string
  phone?: string
}

export interface VerifyHostPayload {
  token?: string
  phone?: string
  otp?: string
}

export interface HostProfile {
  id: string
  public_id: string
  tier: string
  created_at: string
}

export interface CurrentHostResponse {
  id: string
  public_id: string
  name: string
  email: string
  tier: 'free' | 'premium'
  avatar: string | null
}

export interface Queue {
  id: string
  [key: string]: unknown
}

/**
 * claimQueue
 * Calls API to claim an anonymous queue as a registered host.
 * @returns API response data
 */
export async function claimQueue(): Promise<{ message: string }> {
  return await apiClient.post(
    API_ROUTES.HOST.CLAIM,
    undefined,
    createApiRequestConfig({}, { withCredentials: true }),
  )
}

export async function logoutHost(): Promise<{ message: string }> {
  return await apiClient.post(
    API_ROUTES.HOST.LOGOUT,
    undefined,
    createApiRequestConfig({}, { withCredentials: true }),
  )
}

/**
 * fetchCurrentHost
 * Fetches the authenticated host profile using cookie-backed auth.
 * @returns Host profile for bootstrapping app auth state
 */
export async function fetchCurrentHost(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>(
    API_ROUTES.HOST.ME,
    createApiRequestConfig({}, { withCredentials: true }),
  )

  return data
}

/**
 * getHostProfile
 * Fetches host profile data by public ID.
 * @param publicId - Host's public ID
 * @returns API response data with host profile
 */
export async function getHostProfile(publicId: string): Promise<HostProfile> {
  return await apiClient.get(API_ROUTES.HOST.GET_PROFILE(publicId))
}

/**
 * getHostQueues
 * Fetches all active queues for a given host public ID.
 * @param publicId - Host's public ID
 * @returns Array of host's active queues
 */
export async function getHostQueues(publicId: string): Promise<Queue[]> {
  return await apiClient.get(API_ROUTES.HOST.GET_QUEUES(publicId))
}

/**
 * authenticate
 * Handles authentication entry point. If the email is social-linked, the backend redirects (302).
 * If not, it sends a magic link.
 * @param email - User's email address
 * @returns Success message for magic link or handle redirection
 */
export async function authenticate(email: string): Promise<{
  message?: string
  method?: 'social' | 'magic-link'
  provider?: 'google' | 'apple'
  redirectUrl?: string
}> {
  const { data } = await apiClient.post(API_ROUTES.HOST.LOGIN, { email })
  return data
}
