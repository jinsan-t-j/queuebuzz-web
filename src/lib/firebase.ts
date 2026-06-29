/**
 * @lib firebase
 * @description Lazy Firebase initialization for FCM push notifications.
 */
import type { FirebaseApp } from 'firebase/app'
import type { MessagePayload } from 'firebase/messaging'

const CONFIG_HASH_KEY = 'fcm_config_hash'
const TOKEN_CACHE_KEY = 'fcm_registration_token'
const SW_PATH = '/firebase-messaging-sw.js'
const SW_READY_TIMEOUT_MS = 10_000

let foregroundUnsubscribe: (() => void) | null = null
let foregroundListenerPromise: Promise<() => void> | null = null

export type FcmTokenFailureReason =
  | 'unsupported'
  | 'permission-not-granted'
  | 'config-missing'
  | 'service-worker-unavailable'
  | 'service-worker-timeout'
  | 'token-empty'
  | 'token-fetch-failed'

export interface FcmTokenResult {
  token: string | null
  reason?: FcmTokenFailureReason
  detail?: string
}

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[]
}

async function getApp(): Promise<FirebaseApp> {
  const { getApps, initializeApp, deleteApp } = await import('firebase/app')

  const existingApp = getApps().find((a) => a.name === '[DEFAULT]')

  if (existingApp) {
    if (existingApp.options.projectId === import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      return existingApp
    }
    await deleteApp(existingApp)
  }

  return initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  })
}

async function getConfigFingerprint(): Promise<string> {
  return `${import.meta.env.VITE_FIREBASE_PROJECT_ID}:${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID}:${import.meta.env.VITE_FIREBASE_VAPID_KEY}`
}

function getMissingConfigFields() {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_VAPID_KEY',
  ]
  return required.filter((f) => !import.meta.env[f])
}

const RETRIABLE_PATTERNS = [
  'abort',
  'timeout',
  'network',
  'service worker',
  'messaging/unknown',
  'token-subscribe-failed',
  'failed-service-worker-registration',
  '20', // DOMException AbortError code
]

function isRetriableTokenError(message: string) {
  const lower = message.toLowerCase()
  return RETRIABLE_PATTERNS.some((p) => lower.includes(p))
}

function wait(ms: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms))
}

async function waitForServiceWorkerActivation(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> {
  const deadline = Date.now() + SW_READY_TIMEOUT_MS

  while (Date.now() < deadline) {
    if (registration.active?.scriptURL?.includes('firebase-messaging-sw.js')) {
      return registration
    }
    await wait(150)
  }

  throw new Error('Timed out waiting for Firebase messaging service worker activation')
}

async function invalidateServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  const swReg = await navigator.serviceWorker.getRegistration(SW_PATH)
  if (swReg) await swReg.unregister()

  const rootReg = await navigator.serviceWorker.getRegistration('/')
  if (rootReg?.active?.scriptURL?.includes('firebase-messaging-sw.js')) {
    await rootReg.unregister()
  }

  localStorage.removeItem(CONFIG_HASH_KEY)
  localStorage.removeItem(TOKEN_CACHE_KEY)
}

/**
 * Ensures a valid service worker registration exists.
 * Invalidates and re-registers if Firebase config has changed.
 */
async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined

  const fingerprint = await getConfigFingerprint()
  const stored = localStorage.getItem(CONFIG_HASH_KEY)

  if (stored && stored !== fingerprint) {
    await invalidateServiceWorkers()
  }

  const existing =
    (await navigator.serviceWorker.getRegistration(SW_PATH)) ||
    (await navigator.serviceWorker.getRegistration('/'))

  if (existing?.active?.scriptURL?.includes('firebase-messaging-sw.js')) {
    existing.update().catch((e) => {
      // eslint-disable-next-line no-console
      console.warn('FCM: Service worker update check failed:', e)
    })
    localStorage.setItem(CONFIG_HASH_KEY, fingerprint)
    return waitForServiceWorkerActivation(existing)
  }

  const registration = await navigator.serviceWorker.register(SW_PATH, {
    scope: '/',
  })
  await navigator.serviceWorker.ready
  localStorage.setItem(CONFIG_HASH_KEY, fingerprint)
  return waitForServiceWorkerActivation(registration)
}

async function isMessagingSupported(): Promise<boolean> {
  if (globalThis.globalThis === undefined) return false
  if (!globalThis.isSecureContext) return false
  if (
    !('Notification' in globalThis) ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in globalThis)
  ) {
    return false
  }

  try {
    const { isSupported } = await import('firebase/messaging')
    return await isSupported()
  } catch {
    return false
  }
}

async function checkEnvironmentReady(): Promise<FcmTokenResult | null> {
  if (typeof globalThis === 'undefined' || !('Notification' in globalThis)) {
    return { token: null, reason: 'unsupported', detail: 'Notifications API is unavailable' }
  }
  if (Notification.permission !== 'granted') {
    return { token: null, reason: 'permission-not-granted', detail: Notification.permission }
  }
  if (!(await isMessagingSupported())) {
    return { token: null, reason: 'unsupported', detail: 'Firebase messaging is not supported' }
  }

  const missing = getMissingConfigFields()
  if (missing.length > 0) {
    const detail = `Missing Firebase environment variables: ${missing.join(', ')}`
    // eslint-disable-next-line no-console
    console.error(`FCM: ${detail}`)
    return { token: null, reason: 'config-missing', detail }
  }

  return null
}

async function performTokenFetch(
  messaging: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  registration: ServiceWorkerRegistration,
) {
  const { getToken } = await import('firebase/messaging')
  return await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  })
}

function extractErrorMessage(error: unknown): string {
  if (!error) return ''
  const err = error as { code?: string | number; name?: string; message?: string }

  if (typeof err.code === 'number') {
    if (err.code === 20) return 'abort'
    if (err.code === 19) return 'network'
    if (err.code === 30) return 'timeout'
  }

  return String(err.code || err.name || err.message || '')
}

async function handleTokenFetchError(error: unknown, attempt: number): Promise<void> {
  const lastErrorMessage = extractErrorMessage(error)
  const isCritical = [
    'registration-token-not-registered',
    'permission-denied',
    'unregistered',
  ].some((s) => lastErrorMessage.includes(s))

  if (isCritical) {
    // eslint-disable-next-line no-console
    console.warn('FCM: Critical registration error, resetting service worker...')
    await invalidateServiceWorkers()
  }

  if (attempt === 0 && isRetriableTokenError(lastErrorMessage)) {
    await wait(250)
    return
  }

  throw error
}

async function fetchTokenWithRetries(
  messaging: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  initialRegistration: ServiceWorkerRegistration,
): Promise<FcmTokenResult> {
  let registration = initialRegistration
  let lastErrorMessage = ''

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const token = await performTokenFetch(messaging, registration)

      if (token) {
        localStorage.setItem(TOKEN_CACHE_KEY, token)
        return { token }
      }

      if (attempt === 0) {
        await invalidateServiceWorkers()
        const newReg = await ensureServiceWorker()
        if (!newReg) {
          return {
            token: null,
            reason: 'service-worker-unavailable',
            detail: 'Service worker registration is unavailable after reset',
          }
        }
        registration = newReg
        continue
      }

      localStorage.removeItem(TOKEN_CACHE_KEY)
      return {
        token: null,
        reason: 'token-empty',
        detail: 'Firebase returned an empty registration token',
      }
    } catch (error) {
      lastErrorMessage = extractErrorMessage(error)
      await handleTokenFetchError(error, attempt)
    }
  }

  return {
    token: null,
    reason: 'token-fetch-failed',
    detail: lastErrorMessage || 'Unknown error while fetching FCM token',
  }
}

/**
 * Obtain an FCM registration token with diagnostic info on failure.
 */
export async function getFCMTokenDetails(): Promise<FcmTokenResult> {
  const envCheck = await checkEnvironmentReady()
  if (envCheck) return envCheck

  try {
    const registration = await ensureServiceWorker()
    if (!registration) {
      return {
        token: null,
        reason: 'service-worker-unavailable',
        detail: 'Service worker registration is unavailable in this browser',
      }
    }

    const { getMessaging } = await import('firebase/messaging')
    const messaging = getMessaging(await getApp())

    return await fetchTokenWithRetries(messaging, registration)
  } catch (error) {
    const errorCode = String(
      (error as { code?: string; message?: string })?.code || (error as Error)?.message || '',
    )
    // eslint-disable-next-line no-console
    console.error('FCM: Token acquisition failed:', errorCode)

    if (
      errorCode.toLowerCase().includes('timed out waiting for firebase messaging service worker')
    ) {
      return { token: null, reason: 'service-worker-timeout', detail: errorCode }
    }

    return { token: null, reason: 'token-fetch-failed', detail: errorCode }
  }
}

/**
 * Show a browser notification from an FCM payload.
 * Prefers service worker registration to ensure consistency with background alerts.
 */
export async function showBrowserNotification(payload: MessagePayload): Promise<boolean> {
  if (typeof globalThis === 'undefined' || !('Notification' in globalThis)) return false
  if (Notification.permission !== 'granted') return false

  const title = payload.notification?.title || payload.data?.title || 'Queue update'
  const options: ExtendedNotificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: payload.notification?.image || payload.data?.icon || '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: payload.data?.event || 'queue-buzz',
    vibrate: [200, 100, 200],
    data: { ...payload.data, link: payload.data?.link || '/' },
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/')
    if (registration) {
      await registration.showNotification(title, options)
      return true
    }
    // Fallback if SW is somehow missing but permission is granted
    new Notification(title, options)
    return true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to show foreground notification:', error)
    return false
  }
}

/**
 * Start listening for foreground FCM messages. Idempotent — subsequent
 * calls return the same promise until `disposeForegroundNotifications` is called.
 */
export function initializeForegroundNotifications(
  callback: (payload: MessagePayload) => void,
): Promise<() => void> {
  if (!foregroundListenerPromise) {
    foregroundListenerPromise = (async () => {
      if (!(await isMessagingSupported())) return () => {}

      await ensureServiceWorker()
      const { getMessaging, onMessage } = await import('firebase/messaging')
      const messaging = getMessaging(await getApp())

      const unsubscribe = onMessage(messaging, callback)
      foregroundUnsubscribe = unsubscribe
      return unsubscribe
    })().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to setup foreground message listener:', error)
      return () => {}
    })
  }

  return foregroundListenerPromise
}

/**
 * Tear down the foreground message listener.
 */
export function disposeForegroundNotifications() {
  foregroundUnsubscribe?.()
  foregroundUnsubscribe = null
  foregroundListenerPromise = null
}
