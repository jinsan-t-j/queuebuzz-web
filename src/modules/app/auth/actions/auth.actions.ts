import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type { AuthUser } from '@/modules/app/auth/types'
import { ApiSuccessResponse } from '@/types/app'

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
export async function fetchCurrentHost(options?: { skipLogout?: boolean }): Promise<AuthUser> {
  const response = (await apiClient.get<ApiSuccessResponse<AuthUser>>(
    API_ROUTES.HOST.ME,
    createApiRequestConfig({}, { withCredentials: true, skipLogout: options?.skipLogout }),
  )) as unknown as ApiSuccessResponse<AuthUser>
  return response.data
}

/**
 * authenticate
 * Handles authentication entry point. If the email is social-linked, the backend redirects (302).
 * If not, it sends a magic link.
 * @param email - User's email address
 * @returns Success message for magic link or handle redirection
 */
export async function authenticate(
  email: string,
  claimQueueId?: string,
): Promise<{
  message?: string
  method?: 'social' | 'magic-link'
  provider?: 'google' | 'apple'
  redirectUrl?: string
}> {
  const response = await apiClient.post<
    ApiSuccessResponse<{
      message?: string
      method?: 'social' | 'magic-link'
      provider?: 'google' | 'apple'
      redirectUrl?: string
    }>
  >(API_ROUTES.HOST.LOGIN, { email, claim_queue_id: claimQueueId })

  return response.data
}
