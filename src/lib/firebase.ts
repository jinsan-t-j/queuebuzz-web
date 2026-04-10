/**
 * @lib firebase
 * @description Lazy Firebase initialization for FCM push notifications.
 */
import type { FirebaseApp } from 'firebase/app'

import { loadFirebaseRuntimeConfig } from '@/lib/firebase-runtime-config'

const CONFIG_HASH_KEY = 'fcm_config_hash'
const TOKEN_CACHE_KEY = 'fcm_registration_token'
const SW_PATH = '/firebase-messaging-sw.js'

async function getApp(): Promise<FirebaseApp> {
  const { getApps, initializeApp, deleteApp } = await import('firebase/app')
  const config = await loadFirebaseRuntimeConfig()

  const apps = getApps()
  const existingApp = apps.find((a) => a.name === '[DEFAULT]')

  if (existingApp) {
    const currentProjectId = (existingApp.options as any).projectId
    if (currentProjectId === config.firebaseProjectId) {
      return existingApp
    }

    console.warn(
      `FCM: Project mismatch (Existing: ${currentProjectId}, Target: ${config.firebaseProjectId}). Resetting...`,
    )
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
    localStorage.setItem(CONFIG_HASH_KEY, fingerprint)
    return existing
  }

  const registration = await navigator.serviceWorker.register(SW_PATH, {
    type: 'module',
    scope: '/',
  })
  await navigator.serviceWorker.ready
  localStorage.setItem(CONFIG_HASH_KEY, fingerprint)
  return registration
}

/**
 * Obtain an FCM registration token.
 * Uses the SDK's internal caching; only hits the network if the token is stale or missing.
 */
export async function getFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null
  if (Notification.permission !== 'granted') return null

  try {
    const config = await loadFirebaseRuntimeConfig()
    const registration = await ensureServiceWorker()
    if (!registration) return null

    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(await getApp())

    // getToken handles the 'should I refresh' logic internally based on the VAPID key.
    const token = await getToken(messaging, {
      vapidKey: config.firebaseVapidKey,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      localStorage.setItem(TOKEN_CACHE_KEY, token)
    }

    return token
  } catch (error: any) {
    const errorCode = error?.code || error?.message || ''
    console.error('FCM: Token acquisition failed:', errorCode)

    // If the error suggests the service worker or project context is broken,
    // we perform a one-time reset.
    if (
      errorCode.includes('registration-token-not-registered') ||
      errorCode.includes('permission-denied') ||
      errorCode.includes('unregistered')
    ) {
      console.warn('FCM: Critical registration error, resetting service worker...')
      await invalidateServiceWorkers()
    }

    return null
  }
}

/**
 * Listen for foreground messages.
 */
export async function onForegroundMessage(callback: (payload: any) => void) {
  try {
    const { getMessaging, onMessage } = await import('firebase/messaging')
    const messaging = getMessaging(await getApp())
    return onMessage(messaging, callback)
  } catch (error) {
    console.error('Failed to setup foreground message listener:', error)
    return () => {}
  }
}
