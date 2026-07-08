/**
 * Global API Constants
 * Define all API endpoints here to avoid hardcoded strings across the app.
 */

// Base URL mapped from Vite env variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const PORT = import.meta.env.VITE_PORT || 3000
export const APP_BASE_URL = import.meta.env.SSR
  ? `http://localhost:${PORT}`
  : globalThis.location.origin

export function buildApiUrl(path: string): string {
  return new URL(`${API_BASE_URL}${path}`).toString()
}

const apiOrigin = new URL(API_BASE_URL).origin
export const AUTH_ROUTES = {
  SOCIAL_START: (provider: string, claimQueueId?: string, redirect?: string): string => {
    const url = new URL(`${apiOrigin}/auth/social/${provider}/start`)
    if (claimQueueId) url.searchParams.set('claim_queue_id', claimQueueId)
    if (redirect) url.searchParams.set('redirect', redirect)
    return url.toString()
  },
} as const

// Centralized route definitions
export const API_ROUTES = {
  HOST: {
    // Auth routes
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/host/me',
    UPDATE_ME: '/host/me',
    DELETE_ME: '/host/me',
    // Queue routes
    CLAIM: '/host/claim',
  },
  QUEUE: {
    CHECK_SLUG: '/queue/slug-check',
    DASHBOARD: '/queue/dashboard',
    GET_LIVE_QUEUE: '/queue/live',
    FIND_QUEUE: () => `/queue/p/find`,
    // Public / Guest
    GET_LIVE_QUEUE_BY_ID: (id: string): string => `/queue/p/${id}/live`,
    GET_PUBLIC_STATUS: (id: string): string => `/queue/p/${id}/public-status`,
    PUBLIC_EVENTS: (id: string): string => `/queue/p/${id}/events`,
    // Host Management
    CONNECT_EVENTS: (id: string): string => `/queue/manage/${id}/events`,
    PAUSE: (id: string): string => `/queue/manage/${id}/pause`,
    RESUME: (id: string): string => `/queue/manage/${id}/resume`,
    TERMINATE: (id: string): string => `/queue/manage/${id}/terminate`,
    CALL_ENTRY: (id: string, entryId?: string): string =>
      `/queue/manage/${id}/call/${entryId || ''}`,
    SERVE: (id: string, entryId: string): string => `/queue/manage/${id}/serve/${entryId}`,
    SKIP: (id: string, entryId: string): string => `/queue/manage/${id}/skip/${entryId}`,
    ADD_ENTRY: (id: string): string => `/queue/manage/${id}/add-entry`,
    UPDATE: (id: string): string => `/queue/manage/${id}`,
    REGISTER_HOST_FCM: (id: string): string => `/queue/manage/${id}/register-host-fcm`,
    UNREGISTER_HOST_FCM: (id: string): string => `/queue/manage/${id}/register-host-fcm`,
  },
  CUSTOMER: {
    JOIN_QUEUE_BY_ID: (id: string): string => `/customer/entry/join/${id}`,
    GET_ENTRY: () => `/customer/entry`,
    ENTRY_EVENTS: () => `/customer/entry/events`,
    CONFIRM_STILL_HERE: () => `/customer/entry/confirm`,
    CONFIRM_ARRIVAL: () => `/customer/entry/arrived`,
    FINISH_SERVICE: () => `/customer/entry/finish`,
    LEAVE_GUEST: '/customer/entry/leave',
    RECOVER_SESSION: '/customer/entry/recover-session',
    RECOVER_SESSION_BY_TOKEN: '/customer/entry/recover-by-token',
    GET_RECOVERY_TOKEN: '/customer/entry/recovery-token',
    SYNC_SESSION: '/customer/entry/sync',
    SUBMIT_RATING: () => `/customer/entry/rating`,
    UPDATE_ENTRY: '/customer/entry/update',
  },
  SHARED: {
    CREATE_QUEUE: '/queue/p/create',
  },
  HISTORY: {
    LIST: '/queue/history',
    CLEAR_ALL: '/queue/history/clear',
    DELETE_BULK: '/queue/history',
    DELETE: (id: string): string => `/queue/history/${id}`,
    DETAIL: (id: string): string => `/queue/manage/${id}/history`,
    EXPORT_CSV: (id: string): string => `/queue/manage/${id}/history/export/csv`,
  },
  BILLING: {
    PLANS: '/billing/plans',
    CHECKOUT: '/billing/checkout',
    CURRENT_PLAN: '/billing/current-plan',
    SUBSCRIPTION: '/billing/subscription',
    CANCEL_SUBSCRIPTION: '/billing/subscription/cancel',
    UPDATE_PAYMENT_METHOD: '/billing/subscription/update-payment-method',
  },
} as const
