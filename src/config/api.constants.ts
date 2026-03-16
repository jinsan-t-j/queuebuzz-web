/**
 * Global API Constants
 * Define all API endpoints here to avoid hardcoded strings across the app.
 */

// Base URL mapped from Vite env variables
export const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
export const API_ORIGIN_URL: string = new URL(API_BASE_URL, window.location.origin).origin

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
        GET_LIVE_QUEUE: (publicId: string): string => `/queue/${publicId}/live`,
    },
    SHARED: {
        CREATE_QUEUE: '/queue/create',
    }

    // Add more modules (e.g. QUEUE, GUEST) here as they grow
} as const
