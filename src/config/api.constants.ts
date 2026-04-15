/**
 * Global API Constants
 * Define all API endpoints here to avoid hardcoded strings across the app.
 */

// Base URL mapped from Vite env variables
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
const url = new URL(
  baseUrl,
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
)

export const API_BASE_URL: string = baseUrl
export const API_ORIGIN_URL: string = url.origin
export const API_BASE_PATH: string = url.pathname.replace(/\/$/, '')

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
    CHECK_METHOD: '/host/check-method',
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
    GET_LIVE_QUEUE_BY_ID: (id: string): string => `/queue/${id}/live`,
    PUBLIC_EVENTS: (id: string): string => `/queue/${id}/events/public`,
    CONNECT_EVENTS: (id: string): string => `/queue/${id}/events`,
    PAUSE: (id: string): string => `/queue/${id}/pause`,
    RESUME: (id: string): string => `/queue/${id}/resume`,
    TERMINATE: (id: string): string => `/queue/${id}/terminate`,
    CALL_ENTRY: (id: string, entryId?: string): string => `/queue/${id}/call/${entryId || ''}`,
    SERVE: (id: string, entryId: string): string => `/queue/${id}/serve/${entryId}`,
    ADD_ENTRY: (id: string): string => `/queue/${id}/add-entry`,
    UPDATE: (id: string): string => `/queue/${id}`,
    REGISTER_HOST_FCM: (id: string): string => `/queue/${id}/register-host-fcm`,
    UNREGISTER_HOST_FCM: (id: string): string => `/queue/${id}/register-host-fcm`,
  },
  CUSTOMER: {
    JOIN_QUEUE_BY_ID: (id: string): string => `/customer/entry/join/${id}`,
    JOIN_BY_CODE: (code: string): string => `/customer/entry/join-by-code/${code}`,
    GET_ENTRY: () => `/customer/entry`,
    ENTRY_EVENTS: () => `/customer/entry/events`,
    CONFIRM_STILL_HERE: () => `/customer/entry/confirm`,
    CONFIRM_ARRIVAL: () => `/customer/entry/arrived`,
    FINISH_SERVICE: () => `/customer/entry/finish`,
    LEAVE_GUEST: '/customer/entry/leave',
    RECOVER_SESSION: '/customer/entry/recover-session',
    SUBMIT_RATING: () => `/customer/entry/rating`,
    UPDATE_ENTRY: '/customer/entry/update',
  },
  SHARED: {
    CREATE_QUEUE: '/queue/create',
  },

  // Add more modules (e.g. QUEUE, GUEST) here as they grow
} as const
