import { API_ROUTES } from '@/config/api.constants'
import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { ApiSuccessResponse } from '@/types/app'

import type {
  JoinQueuePayload,
  MutationResult,
  JoinByCodeResult,
  JoinByCodeResponse,
  Entry,
} from '../types'

/**
 * Customer actions for queue interaction.
 * STUB implementation — Phase 2: replace with real backend calls.
 */

export async function joinQueue(queueId: string, payload: JoinQueuePayload): Promise<Entry> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  const body = {
    display_name: payload.name || 'Guest',
    email: payload.email,
    phone: payload.phone,
    party_size: payload.partySize || 1,
    notification_enabled: payload.notificationEnabled,
    fcm_token: payload.fcmToken,
    join_code: payload.code,
  }

  const response = (await apiClient.post<ApiSuccessResponse<Entry>>(
    API_ROUTES.CUSTOMER.JOIN_QUEUE_BY_ID(queueId),
    body,
    config,
  )) as unknown as ApiSuccessResponse<Entry>
  return response.data
}

export async function fetchEntry(): Promise<Entry | null> {
  const config = createApiRequestConfig({}, { withCredentials: true, skipLogout: true })
  try {
    const response = (await apiClient.get<ApiSuccessResponse<Entry>>(
      API_ROUTES.CUSTOMER.GET_ENTRY(),
      config,
    )) as unknown as ApiSuccessResponse<Entry>
    return response.data
  } catch {
    return null
  }
}

export async function confirmStillHere(): Promise<MutationResult> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  try {
    await apiClient.post(API_ROUTES.CUSTOMER.CONFIRM_STILL_HERE(), {}, config)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function confirmArrival(): Promise<MutationResult> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  try {
    await apiClient.post(API_ROUTES.CUSTOMER.CONFIRM_ARRIVAL(), {}, config)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function finishService(): Promise<MutationResult> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  try {
    await apiClient.post(API_ROUTES.CUSTOMER.FINISH_SERVICE(), {}, config)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function leaveQueue(): Promise<MutationResult> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  try {
    await apiClient.post(API_ROUTES.CUSTOMER.LEAVE_GUEST, null, config)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function recoverGuestSession(): Promise<Entry | null> {
  const config = createApiRequestConfig({}, { withCredentials: true, skipLogout: true })
  try {
    const response = (await apiClient.get<ApiSuccessResponse<Entry>>(
      API_ROUTES.CUSTOMER.RECOVER_SESSION,
      config,
    )) as unknown as ApiSuccessResponse<Entry>
    return response.data || null
  } catch {
    return null
  }
}

export async function recoverGuestSessionByToken(token: string): Promise<Entry | null> {
  const config = createApiRequestConfig({}, { withCredentials: true, skipLogout: true })
  try {
    const response = (await apiClient.get<ApiSuccessResponse<Entry>>(
      `${API_ROUTES.CUSTOMER.RECOVER_SESSION_BY_TOKEN}?token=${encodeURIComponent(token)}`,
      config,
    )) as unknown as ApiSuccessResponse<Entry>
    return response.data || null
  } catch {
    return null
  }
}

export async function submitRating(rating: number): Promise<MutationResult> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  try {
    await apiClient.post(API_ROUTES.CUSTOMER.SUBMIT_RATING(), { rating }, config)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function updateEntry(payload: {
  name?: string
  email?: string
  partySize?: number
  fcmToken?: string
}): Promise<MutationResult> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  try {
    const body = {
      name: payload.name,
      email: payload.email,
      party_size: payload.partySize,
      fcm_token: payload.fcmToken,
    }
    await apiClient.post(API_ROUTES.CUSTOMER.UPDATE_ENTRY, body, config)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function joinByCode(code: string): Promise<JoinByCodeResult> {
  const config = createApiRequestConfig()
  try {
    const response = (await apiClient.get<ApiSuccessResponse<JoinByCodeResponse>>(
      API_ROUTES.CUSTOMER.JOIN_BY_CODE(code),
      config,
    )) as unknown as ApiSuccessResponse<JoinByCodeResponse>

    const data = response.data

    if (!data?.queueId) {
      return { found: false }
    }

    return {
      found: true,
      queueName: data.queueName,
      queueId: data.queueId,
    }
  } catch {
    return { found: false }
  }
}
