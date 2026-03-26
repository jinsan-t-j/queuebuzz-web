/**
 * Global API Constants
 * Define all API endpoints here to avoid hardcoded strings across the app.
 */

// Base URL mapped from Vite env variables
export const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
export const API_ORIGIN_URL: string = new URL(API_BASE_URL, window.location.origin).origin
export const API_BASE_PATH: string = new URL(API_BASE_URL, window.location.origin).pathname.replace(/\/$/, '')

export function buildApiUrl(path: string): string {
    return new URL(`${API_BASE_PATH}${path}`, API_ORIGIN_URL).toString()
}

export const AUTH_ROUTES = {
    SOCIAL_START: (provider: string): string => `${API_ORIGIN_URL}/auth/social/${provider}/start`,
} as const

// Centralized route definitions
export const API_ROUTES = {
    HOST: {
        // Auth routes
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/host/me',
        // Queue routes
        CLAIM: '/host/claim',
        GET_PROFILE: (publicId: string): string => `/host/${publicId}`,
        GET_QUEUES: (publicId: string): string => `/host/${publicId}/queues`,
    },
    QUEUE: {
        CHECK_SLUG: '/queue/slug-check',
        GET_LIVE_QUEUE: '/queue/live',
        GET_QUEUE_STATUS: (id: string): string => `/queue/${id}/live/status`,
        GET_LIVE_QUEUE_BY_ID: (id: string): string => `/queue/${id}/live`,
        PAUSE: (id: string): string => `/queue/${id}/pause`,
        RESUME: (id: string): string => `/queue/${id}/resume`,
        TERMINATE: (id: string): string => `/queue/${id}/terminate`,
        CALL_NEXT: (id: string): string => `/queue/${id}/next`,
        CALL_GUEST: (id: string, entryId: string): string => `/queue/${id}/call/${entryId}`,
        SKIP: (id: string, entryId: string): string => `/queue/${id}/skip/${entryId}`,
        SERVE: (id: string, entryId: string): string => `/queue/${id}/serve/${entryId}`,
        ADD_ENTRY: (id: string): string => `/queue/${id}/add-entry`,
        UPDATE: (id: string): string => `/queue/${id}`,
        CONNECT_EVENTS: (id: string): string => `/queue/${id}/events`,
    },
    SHARED: {
        CREATE_QUEUE: '/queue/create',
    }

    // Add more modules (e.g. QUEUE, GUEST) here as they grow
} as const
