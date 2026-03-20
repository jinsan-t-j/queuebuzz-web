import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type { QueueRecord, QueueEntry } from '../types'

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
    const response = await apiClient.post<QueueRecord>(API_ROUTES.SHARED.CREATE_QUEUE, payload, config)
    return response.data
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
    const config = createApiRequestConfig()
    const response = await apiClient.get<CheckSlugAvailabilityResponse>(
        `${API_ROUTES.QUEUE.CHECK_SLUG}?slug=${encodeURIComponent(slug)}`,
        config,
    )
    return response.data.isAvailable
}

export async function getLiveQueue(): Promise<QueueRecord> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.get<QueueRecord>(API_ROUTES.QUEUE.GET_LIVE_QUEUE, config)
    return response.data
}

export async function getLiveQueueById(id: string): Promise<QueueRecord> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.get<QueueRecord>(API_ROUTES.QUEUE.GET_LIVE_QUEUE_BY_ID(id), config)

    return response.data
}

export async function callNext(id: string): Promise<QueueEntry> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.post<QueueEntry>(API_ROUTES.QUEUE.CALL_NEXT(id), null, config)

    return response.data
}

export async function addQueueEntry(id: string, payload: AddQueueEntryPayload): Promise<QueueEntry> {
    const config = createApiRequestConfig({}, { withCredentials: true })
    const response = await apiClient.post<QueueEntry>(API_ROUTES.QUEUE.ADD_ENTRY(id), payload, config)

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
