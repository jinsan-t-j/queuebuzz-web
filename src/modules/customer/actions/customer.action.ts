import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type { ApiSuccessResponse } from '@/modules/app/queue/types'
import type {
    JoinQueuePayload,
    JoinQueueResult,
    WaitingStatus,
    MutationResult,
    JoinByCodeResult
} from '../types'

/**
 * Customer actions for queue interaction.
 * STUB implementation — Phase 2: replace with real backend calls.
 */

export async function joinQueue(queueId: string, payload: JoinQueuePayload): Promise<JoinQueueResult | null> {
    const config = createApiRequestConfig()
    try {
        const body = {
            display_name: payload.name || 'Guest',
            email: payload.email,
            phone: payload.phone,
            party_size: payload.partySize || 1,
            notification_enabled: payload.notificationEnabled,
            fcm_token: payload.fcmToken
        }

        const response = await apiClient.post<any>(API_ROUTES.CUSTOMER.JOIN_QUEUE_BY_ID(queueId), body, config)
        const data = response.data
        return {
            id: data.id,
            ticketNumber: data.ticket_no,
            position: data.position,
            ahead: data.ahead,
            estWaitMin: data.est_wait_min,
            totalInQueue: data.total_in_queue,
            servedCount: data.served_count
        }
    } catch (e) {
        console.error('Failed to join queue:', e)
        throw e
    }
}

export async function fetchWaitingStatus(ticketId: string): Promise<WaitingStatus | null> {
    const config = createApiRequestConfig()
    try {
        // STUB — replace with: return await apiClient.get(API_ROUTES.CUSTOMER.GET_TICKET_STATUS(ticketId), config)
        await new Promise(r => setTimeout(r, 500))
        return {
            id: 'fwfdw',
            ticketNumber: 'Q-0042',
            position: 4,
            ahead: 3,
            estWaitMin: 12,
            totalInQueue: 23,
            servedCount: 8,
            status: 'waiting',
            buzzEnabled: true,
        }
    } catch (e) {
        console.error('Failed to fetch waiting status:', e)
        return null
    }
}

export async function confirmStillHere(ticketId: string): Promise<MutationResult> {
    const config = createApiRequestConfig()
    try {
        // STUB — replace with: return await apiClient.post(API_ROUTES.CUSTOMER.CONFIRM_STILL_HERE(ticketId), null, config)
        await new Promise(r => setTimeout(r, 300))
        return { success: true }
    } catch (e) {
        console.error('Failed to confirm still here:', e)
        return { success: false }
    }
}

export async function confirmArrival(ticketId: string): Promise<MutationResult> {
    const config = createApiRequestConfig()
    try {
        // STUB — replace with: return await apiClient.post(API_ROUTES.CUSTOMER.CONFIRM_ARRIVAL(ticketId), null, config)
        await new Promise(r => setTimeout(r, 300))
        return { success: true }
    } catch (e) {
        console.error('Failed to confirm arrival:', e)
        return { success: false }
    }
}

export async function leaveQueue(ticketId: string): Promise<MutationResult> {
    const config = createApiRequestConfig()
    try {
        // STUB — replace with: return await apiClient.post(API_ROUTES.CUSTOMER.LEAVE(ticketId), null, config)
        await new Promise(r => setTimeout(r, 300))
        return { success: true }
    } catch (e) {
        console.error('Failed to leave queue:', e)
        return { success: false }
    }
}

export async function submitRating(ticketId: string, rating: number): Promise<MutationResult> {
    const config = createApiRequestConfig()
    try {
        // STUB — replace with: return await apiClient.post(API_ROUTES.CUSTOMER.SUBMIT_RATING(ticketId), { rating }, config)
        await new Promise(r => setTimeout(r, 300))
        return { success: true }
    } catch (e) {
        console.error('Failed to submit rating:', e)
        return { success: false }
    }
}

export async function joinByCode(code: string): Promise<JoinByCodeResult> {
    const config = createApiRequestConfig()
    try {
        const response = await apiClient.get<any>(API_ROUTES.CUSTOMER.RESOLVE_CODE(code), config)
        return {
            found: true,
            queueName: response.data.queue_name,
            queueId: response.data.queue_id
        }
    } catch (e) {
        console.error('Failed to resolve code:', e)
        return { found: false }
    }
}
