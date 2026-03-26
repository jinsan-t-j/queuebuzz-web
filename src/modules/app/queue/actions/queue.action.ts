import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type {
    ApiSuccessResponse,
    QueueRecord,
    QueueEntry,
    AddQueueEntryPayload,
    UpdateQueuePayload,
} from '../types'

export interface CreateQueuePayload {
    name: string
    avgServiceMins: number
    slug?: string
    recoveryEmail?: string
    allowPartyJoining: boolean
    maxPartySize: number
}

export interface CheckSlugAvailabilityResponse {
    isAvailable: boolean
}

export interface QueueStatusResponse {
    id: string
    status: 'active' | 'paused' | 'terminated' | 'expired'
    joinCode: string
    waitingCount: number
    avgServiceMins: number
    expiresAt: string
}

export async function createQueue(payload: CreateQueuePayload): Promise<QueueRecord> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.post<ApiSuccessResponse<QueueRecord>>(API_ROUTES.SHARED.CREATE_QUEUE, payload, config) as unknown as ApiSuccessResponse<QueueRecord>
    return response.data
}

export async function updateQueue(id: string, payload: UpdateQueuePayload): Promise<QueueRecord> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.patch<ApiSuccessResponse<QueueRecord>>(API_ROUTES.QUEUE.UPDATE(id), payload, config) as unknown as ApiSuccessResponse<QueueRecord>
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

export async function getLiveQueue(): Promise<QueueRecord> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.get<ApiSuccessResponse<QueueRecord>>(API_ROUTES.QUEUE.GET_LIVE_QUEUE, config) as unknown as ApiSuccessResponse<QueueRecord>
    return response.data
}

export async function getLiveQueueById(id: string): Promise<QueueRecord> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.get<ApiSuccessResponse<QueueRecord>>(API_ROUTES.QUEUE.GET_LIVE_QUEUE_BY_ID(id), config) as unknown as ApiSuccessResponse<QueueRecord>
    return response.data
}

export async function getQueueStatus(id: string): Promise<QueueStatusResponse> {
    const config = createApiRequestConfig()
    const response = await apiClient.get<ApiSuccessResponse<QueueStatusResponse>>(API_ROUTES.QUEUE.GET_QUEUE_STATUS(id), config) as unknown as ApiSuccessResponse<QueueStatusResponse>
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

export async function callGuest(id: string, entryId: string): Promise<void> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    await apiClient.post(API_ROUTES.QUEUE.CALL_GUEST(id, entryId), null, config)
}

export async function serveGuest(id: string, entryId: string): Promise<void> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    await apiClient.post(API_ROUTES.QUEUE.SERVE(id, entryId), null, config)
}
