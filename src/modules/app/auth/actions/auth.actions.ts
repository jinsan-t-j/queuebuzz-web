import { apiClient } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'

export interface RegisterHostPayload {
    email?: string
    phone?: string
}

export interface VerifyHostPayload {
    token?: string
    phone?: string
    otp?: string
}

export interface VerifyHostResponse {
    access_token: string
    expires_at: string
    token_type: string
    host_id: string
    host_public_id: string
}

export interface HostProfile {
    id: string
    public_id: string
    tier: string
    created_at: string
}

export interface Queue {
    id: string
    [key: string]: any
}

/**
 * registerHost
 * Calls the API to send a magic link or OTP to a host.
 * @param payload - RegisterHostPayload
 * @returns API response data
 */
export async function registerHost({ email, phone }: RegisterHostPayload): Promise<{ message: string }> {
    const payload: RegisterHostPayload = {}
    if (email) payload.email = email
    if (phone) payload.phone = phone

    return await apiClient.post(API_ROUTES.HOST.REGISTER, payload)
}

/**
 * verifyHost
 * Calls the API to verify a magic link token or OTP.
 * @param payload - VerifyHostPayload
 * @returns API response data containing tokens and host info
 */
export async function verifyHost({ token, phone, otp }: VerifyHostPayload): Promise<VerifyHostResponse> {
    const payload: VerifyHostPayload = {}
    if (token) payload.token = token
    if (phone) payload.phone = phone
    if (otp) payload.otp = otp

    return await apiClient.post(API_ROUTES.HOST.VERIFY, payload)
}

/**
 * claimQueue
 * Calls API to claim an anonymous queue as a registered host.
 * @returns API response data
 */
export async function claimQueue(): Promise<{ message: string }> {
    return await apiClient.post(API_ROUTES.HOST.CLAIM)
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
