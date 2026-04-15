/**
 * @lib firebase
 * @description Lazy Firebase initialization for FCM push notifications.
 */
import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import type { MessagePayload } from 'firebase/messaging'

import { loadFirebaseRuntimeConfig } from '@/lib/firebase-runtime-config'
import type { FirebaseRuntimeConfig } from '@/lib/firebase-runtime-config'

const CONFIG_HASH_KEY = 'fcm_config_hash'
const TOKEN_CACHE_KEY = 'fcm_registration_token'
const SW_PATH = '/firebase-messaging-sw.js'
const SW_READY_TIMEOUT_MS = 10000
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

function getNotificationContent(payload: MessagePayload) {
  const extendedPayload = payload as MessagePayload & {
    fcmOptions?: { link?: string }
  }

  return {
    title: payload.notification?.title || payload.data?.title || 'Wait list update',
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.image || payload.data?.icon || '/icons/notification-icon.png',
    badge: payload.data?.badge || '/icons/badge-icon.png',
    tag: payload.data?.event || 'queue-buzz',
    link: extendedPayload.fcmOptions?.link || payload.data?.link || '/',
  }
}

async function getApp(): Promise<FirebaseApp> {
  const { getApps, initializeApp, deleteApp } = await import('firebase/app')
  const config = await loadFirebaseRuntimeConfig()

  const apps = getApps()
  const existingApp = apps.find((a) => a.name === '[DEFAULT]')

  if (existingApp) {
    const currentProjectId = (existingApp.options as FirebaseOptions).projectId
    if (currentProjectId === config.firebaseProjectId) {
      return existingApp
    }
    await deleteApp(existingApp)
  }

  return initializeApp({
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain,
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket,
    messagingSenderId: config.firebaseMessagingSenderId,
    appId: config.firebaseAppId,
  })
}

async function getConfigFingerprint(): Promise<string> {
  const config = await loadFirebaseRuntimeConfig(true)
  return btoa(
    JSON.stringify({
      v: config.firebaseVapidKey,
      s: config.firebaseMessagingSenderId,
      a: config.firebaseApiKey,
      p: config.firebaseProjectId,
    }),
  )
}

function getMissingConfigFields(config: FirebaseRuntimeConfig) {
  const requiredFields: Array<keyof FirebaseRuntimeConfig> = [
    'firebaseApiKey',
    'firebaseAuthDomain',
    'firebaseProjectId',
    'firebaseStorageBucket',
    'firebaseMessagingSenderId',
    'firebaseAppId',
    'firebaseVapidKey',
  ]

  return requiredFields.filter((field) => !config[field])
}

function isRetriableTokenError(message: string) {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('abort') ||
    normalized.includes('timeout') ||
    normalized.includes('network') ||
    normalized.includes('service worker') ||
    normalized.includes('messaging/unknown')
  )
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function waitForServiceWorkerActivation(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> {
  const startedAt = Date.now()

  while (Date.now() - startedAt < SW_READY_TIMEOUT_MS) {
    if (registration.active?.scriptURL?.includes('firebase-messaging-sw.js')) {
      return registration
    }

    await wait(150)
  }

  throw new Error('Timed out waiting for Firebase messaging service worker activation')
}

async function invalidateServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.getRegistration(SW_PATH)
  if (registration) {
    await registration.unregister()
  }

  const rootRegistration = await navigator.serviceWorker.getRegistration('/')
  if (rootRegistration?.active?.scriptURL?.includes('firebase-messaging-sw.js')) {
    await rootRegistration.unregister()
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
    await existing.update()
    localStorage.setItem(CONFIG_HASH_KEY, fingerprint)
    return waitForServiceWorkerActivation(existing)
  }

  const registration = await navigator.serviceWorker.register(SW_PATH, {
    type: 'module',
    scope: '/',
  })
  await navigator.serviceWorker.ready
  localStorage.setItem(CONFIG_HASH_KEY, fingerprint)
  return waitForServiceWorkerActivation(registration)
}

async function isMessagingSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!window.isSecureContext) return false
  if (
    !('Notification' in window) ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
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

/**
 * Obtain an FCM registration token.
 * Uses the SDK's internal caching; only hits the network if the token is stale or missing.
 */
export async function getFCMToken(): Promise<string | null> {
  const result = await getFCMTokenDetails()
  return result.token
}

export async function getFCMTokenDetails(): Promise<FcmTokenResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { token: null, reason: 'unsupported', detail: 'Notifications API is unavailable' }
  }
  if (Notification.permission !== 'granted') {
    return { token: null, reason: 'permission-not-granted', detail: Notification.permission }
  }
  if (!(await isMessagingSupported())) {
    return { token: null, reason: 'unsupported', detail: 'Firebase messaging is not supported' }
  }

  try {
    const config = await loadFirebaseRuntimeConfig()
    const missingConfigFields = getMissingConfigFields(config)
    if (missingConfigFields.length > 0) {
      const detail = `Missing Firebase config: ${missingConfigFields.join(', ')}`
      // eslint-disable-next-line no-console
      console.error(`FCM: ${detail}`)
      return { token: null, reason: 'config-missing', detail }
    }

    let registration = await ensureServiceWorker()
    if (!registration) {
      return {
        token: null,
        reason: 'service-worker-unavailable',
        detail: 'Service worker registration is unavailable in this browser',
      }
    }

    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(await getApp())

    // getToken handles the 'should I refresh' logic internally based on the VAPID key.
    let lastErrorMessage = ''

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const token = await getToken(messaging, {
          vapidKey: config.firebaseVapidKey,
          serviceWorkerRegistration: registration,
        })

        if (token) {
          localStorage.setItem(TOKEN_CACHE_KEY, token)
          return { token }
        }

        if (attempt === 0) {
          await invalidateServiceWorkers()
          registration = await ensureServiceWorker()
          if (!registration) {
            return {
              token: null,
              reason: 'service-worker-unavailable',
              detail: 'Service worker registration is unavailable after reset',
            }
          }
          continue
        }

        localStorage.removeItem(TOKEN_CACHE_KEY)
        return {
          token: null,
          reason: 'token-empty',
          detail: 'Firebase returned an empty registration token',
        }
      } catch (error) {
        lastErrorMessage =
          (error as { code?: string; message?: string })?.code || (error as Error)?.message || ''

        if (
          lastErrorMessage.includes('registration-token-not-registered') ||
          lastErrorMessage.includes('permission-denied') ||
          lastErrorMessage.includes('unregistered')
        ) {
          // eslint-disable-next-line no-console
          console.warn('FCM: Critical registration error, resetting service worker...')
          await invalidateServiceWorkers()
        }

        if (attempt === 0 && isRetriableTokenError(lastErrorMessage)) {
          await wait(250)
          continue
        }

        throw error
      }
    }

    return {
      token: null,
      reason: 'token-fetch-failed',
      detail: lastErrorMessage || 'Unknown error while fetching FCM token',
    }
  } catch (error) {
    const errorCode =
      (error as { code?: string; message?: string })?.code || (error as Error)?.message || ''
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
 * Listen for foreground messages.
 */
export async function onForegroundMessage(callback: (payload: MessagePayload) => void) {
  try {
    if (!(await isMessagingSupported())) {
      return () => {}
    }

    await ensureServiceWorker()

    const { getMessaging, onMessage } = await import('firebase/messaging')
    const messaging = getMessaging(await getApp())
    return onMessage(messaging, callback)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to setup foreground message listener:', error)
    return () => {}
  }
}

export async function showBrowserNotification(payload: MessagePayload): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission !== 'granted') return false

  const { title, body, icon, badge, tag, link } = getNotificationContent(payload)
  if (!title) return false

  const options: NotificationOptions = {
    body,
    icon,
    badge,
    tag,
    data: {
      ...(payload.data || {}),
      link,
    },
  }

  try {
    const registration =
      (await navigator.serviceWorker.getRegistration(SW_PATH)) ||
      (await navigator.serviceWorker.getRegistration('/'))

    if (registration) {
      await registration.showNotification(title, options)
      return true
    }

    new Notification(title, options)
    return true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to show browser notification:', error)
    return false
  }
}

export function initializeForegroundNotifications(
  callback: (payload: MessagePayload) => void,
): Promise<() => void> {
  if (!foregroundListenerPromise) {
    foregroundListenerPromise = onForegroundMessage((payload) => {
      callback(payload)
    }).then((unsubscribe) => {
      foregroundUnsubscribe = unsubscribe
      return unsubscribe
    })
  }

  return foregroundListenerPromise
}

export function disposeForegroundNotifications() {
  foregroundUnsubscribe?.()
  foregroundUnsubscribe = null
  foregroundListenerPromise = null
}
