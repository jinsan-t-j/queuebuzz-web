import { API_ROUTES } from '@/config/api.constants'
import { apiClient, createApiRequestConfig } from '@/lib/axios'
import type { UserTier } from '@/modules/app/auth/types'
import type { ApiSuccessResponse } from '@/types/app'

export interface UserSettings {
  name: string
  business_name: string
  address: string
  email: string
  phone: string | null
  tier: UserTier
  profileImageUrl: string | null
  bannerImageUrl: string | null
  slug?: string
  settings: {
    defaultQueueName: string
    avgServiceMins: number
    emailNotifications: boolean
    pushNotifications: boolean
    collectEmails: boolean
  }
}

/**
 * @action fetchUserSettings
 * @description Fetches the current host's settings and profile.
 */
export async function fetchUserSettings(): Promise<UserSettings> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  const response = (await apiClient.get<ApiSuccessResponse<UserSettings>>(
    API_ROUTES.HOST.ME,
    config,
  )) as unknown as ApiSuccessResponse<UserSettings>
  return response.data
}

/**
 * @action updateUserSettings
 * @description Updates host profile or settings fields.
 */
export async function updateUserSettings(payload: Partial<UserSettings> | FormData): Promise<void> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  await apiClient.patch(API_ROUTES.HOST.UPDATE_ME, payload, config)
}

/**
 * @action clearQueueHistory
 * @description Deletes all history sessions for the host.
 */
export async function clearQueueHistory(): Promise<void> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  await apiClient.post(API_ROUTES.HISTORY.CLEAR_ALL, {}, config)
}

/**
 * @action deleteAccount
 * @description Permanently deletes the host account.
 */
export async function deleteAccount(): Promise<void> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  await apiClient.delete(API_ROUTES.HOST.DELETE_ME, config)
}
