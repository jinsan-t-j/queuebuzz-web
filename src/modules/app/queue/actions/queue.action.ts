import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type { ApiSuccessResponse, LiveQueueResponse, QueueEntry, QueueRecord } from '../types'

export interface CreateQueuePayload {
    name: string
    avgServiceMins: number
    slug?: string
    recoveryEmail?: string
    allowPartyJoining: boolean
    maxPartySize: number
}

export interface AddQueueEntryPayload {
    name: string
    phone?: string
    email?: string
    partySize?: number
}

export interface CheckSlugAvailabilityResponse {
    isAvailable: boolean
}

export async function createQueue(payload: CreateQueuePayload): Promise<QueueRecord> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.post<ApiSuccessResponse<QueueRecord>>(API_ROUTES.SHARED.CREATE_QUEUE, payload, config) as unknown as ApiSuccessResponse<QueueRecord>
    return response.data
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
    const config = createApiRequestConfig()
    const response = await apiClient.get<ApiSuccessResponse<CheckSlugAvailabilityResponse>>(
        `${API_ROUTES.QUEUE.CHECK_SLUG}?slug=${encodeURIComponent(slug)}`,
        config,
    ) as unknown as ApiSuccessResponse<CheckSlugAvailabilityResponse>
    return response.data.isAvailable
}

export async function getLiveQueue(): Promise<LiveQueueResponse> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.get<ApiSuccessResponse<LiveQueueResponse>>(API_ROUTES.QUEUE.GET_LIVE_QUEUE, config) as unknown as ApiSuccessResponse<LiveQueueResponse>
    return response.data
}

export async function getLiveQueueById(id: string): Promise<LiveQueueResponse> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.get<ApiSuccessResponse<LiveQueueResponse>>(API_ROUTES.QUEUE.GET_LIVE_QUEUE_BY_ID(id), config) as unknown as ApiSuccessResponse<LiveQueueResponse>
    return response.data
}

export async function callNext(id: string): Promise<QueueEntry> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.post<QueueEntry>(API_ROUTES.QUEUE.CALL_NEXT(id), null, config) as unknown as QueueEntry

    return response
}

export async function addQueueEntry(id: string, payload: AddQueueEntryPayload): Promise<QueueEntry> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.post<ApiSuccessResponse<QueueEntry>>(API_ROUTES.QUEUE.ADD_ENTRY(id), payload, config) as unknown as ApiSuccessResponse<QueueEntry>

    return response.data
}

export async function pauseQueue(id: string): Promise<void> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    await apiClient.post(API_ROUTES.QUEUE.PAUSE(id), null, config)
}

export async function resumeQueue(id: string): Promise<void> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    await apiClient.post(API_ROUTES.QUEUE.RESUME(id), null, config)
}

export async function terminateQueue(id: string): Promise<void> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    await apiClient.post(API_ROUTES.QUEUE.TERMINATE(id), null, config)
}
