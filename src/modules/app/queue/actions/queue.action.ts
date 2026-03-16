import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import { QueueRecord } from '../types'

export interface CreateQueuePayload {
    name: string
    avgServiceMins: number
    slug?: string
    recoveryEmail?: string
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
    const response = await apiClient.get<CheckSlugAvailabilityResponse>(`${API_ROUTES.QUEUE.CHECK_SLUG}?slug=${encodeURIComponent(slug)}`, config)

    return response.data.isAvailable
}

export async function getLiveQueue(publicId: string): Promise<QueueRecord> {
    const response = await apiClient.get<QueueRecord>(API_ROUTES.QUEUE.GET_LIVE_QUEUE(publicId), createApiRequestConfig({}, { withCredentials: true }))

    return response.data
}
