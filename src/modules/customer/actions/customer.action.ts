import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type {
    JoinQueuePayload,
    MutationResult,
    JoinByCodeResult,
    Entry
} from '../types'
import { ApiSuccessResponse } from '@/types/app'

/**
 * Customer actions for queue interaction.
 * STUB implementation — Phase 2: replace with real backend calls.
 */

export async function joinQueue(queueId: string, payload: JoinQueuePayload): Promise<Entry> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    try {
        const body = {
            display_name: payload.name || 'Guest',
            email: payload.email,
            phone: payload.phone,
            party_size: payload.partySize || 1,
            notification_enabled: payload.notificationEnabled,
            fcm_token: payload.fcmToken
        }

        const response = await apiClient.post<ApiSuccessResponse<Entry>>(API_ROUTES.CUSTOMER.JOIN_QUEUE_BY_ID(queueId), body, config) as unknown as ApiSuccessResponse<Entry>
        return response.data
    } catch (e) {
        console.error('Failed to join queue:', e)
        throw e
    }
}

export async function fetchEntry(): Promise<Entry | null> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    try {
        const response = await apiClient.get<ApiSuccessResponse<Entry>>(API_ROUTES.CUSTOMER.GET_ENTRY(), config) as unknown as ApiSuccessResponse<Entry>
        return response.data
    } catch (e) {
        console.error('Failed to fetch entry:', e)
        return null
    }
}

export async function confirmStillHere(): Promise<MutationResult> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    try {
        await apiClient.post(API_ROUTES.CUSTOMER.CONFIRM_STILL_HERE(), {}, config)
        return { success: true }
    } catch (e) {
        console.error('Failed to confirm still here:', e)
        return { success: false }
    }
}

export async function confirmArrival(): Promise<MutationResult> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    try {
        await apiClient.post(API_ROUTES.CUSTOMER.CONFIRM_ARRIVAL(), {}, config)
        return { success: true }
    } catch (e) {
        console.error('Failed to confirm arrival:', e)
        return { success: false }
    }
}

export async function leaveQueue(): Promise<MutationResult> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    try {
        await apiClient.post(API_ROUTES.CUSTOMER.LEAVE_GUEST, null, config)
        return { success: true }
    } catch (e) {
        console.error('Failed to leave queue:', e)
        return { success: false }
    }
}

export async function recoverGuestSession(): Promise<Entry | null> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    try {
        const response = await apiClient.get<ApiSuccessResponse<Entry>>(API_ROUTES.CUSTOMER.RECOVER_SESSION, config) as unknown as ApiSuccessResponse<Entry>
        return response.data || null
    } catch (e) {
        console.error('Failed to recover session:', e)
        return null
    }
}

export async function submitRating(rating: number): Promise<MutationResult> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    try {
        await apiClient.post(API_ROUTES.CUSTOMER.SUBMIT_RATING(), { rating }, config)
        return { success: true }
    } catch (e) {
        console.error('Failed to submit rating:', e)
        return { success: false }
    }
}

export async function updateEmail(email: string): Promise<MutationResult> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    try {
        await apiClient.post(API_ROUTES.CUSTOMER.UPDATE_EMAIL, { email }, config)
        return { success: true }
    } catch (e) {
        return { success: false }
    }
}

export async function updatePIN(pin: string): Promise<MutationResult> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    try {
        await apiClient.post(API_ROUTES.CUSTOMER.UPDATE_PIN, { pin }, config)
        return { success: true }
    } catch (e) {
        return { success: false }
    }
}

export async function joinByCode(code: string): Promise<JoinByCodeResult> {
    const config = createApiRequestConfig()
    try {
        const response = await apiClient.get<ApiSuccessResponse<JoinByCodeResult>>(API_ROUTES.CUSTOMER.RESOLVE_CODE(code), config) as unknown as ApiSuccessResponse<JoinByCodeResult>
        return {
            found: true,
            queueName: response.data.queueName,
            queueId: response.data.queueId
        }
    } catch (e) {
        console.error('Failed to resolve code:', e)
        return { found: false }
    }
}
