/**
 * @file firebase-messaging-sw.js
 * @description Mandatory service worker for Firebase Cloud Messaging (FCM).
 * This uses the modern Firebase v11 modular SDK and is bundled by Vite.
 */

import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

const FIREBASE_CONFIG_PLACEHOLDER = null
const RUNTIME_CONFIG_PATH = '/firebase-config.json'

async function loadRuntimeConfig() {
  if (FIREBASE_CONFIG_PLACEHOLDER) {
    return FIREBASE_CONFIG_PLACEHOLDER
  }

  const response = await fetch(`${RUNTIME_CONFIG_PATH}?t=${Date.now()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to load Firebase runtime config: ${response.status}`)
  }

  return response.json()
}

function getNotificationDetails(payload) {
  const link = payload?.fcmOptions?.link || payload?.data?.link || '/'

  return {
    title: payload?.notification?.title || payload?.data?.title || 'Wait list update',
    options: {
      body: payload?.notification?.body || payload?.data?.body,
      icon: payload?.notification?.image || '/icons/notification-icon.png',
      tag: payload?.data?.event || 'queue-buzz',
      data: {
        ...payload?.data,
        link,
      },
      badge: '/icons/badge-icon.png',
    },
  }
}

async function initializeMessaging() {
  const config = await loadRuntimeConfig()

  const app = initializeApp({
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain,
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket,
    messagingSenderId: config.firebaseMessagingSenderId,
    appId: config.firebaseAppId,
  })
  const messaging = getMessaging(app)

  /**
   * Handle background messages
   */
  onBackgroundMessage(messaging, (payload) => {
    const { title, options } = getNotificationDetails(payload)
    void self.registration.showNotification(title, options)
  })
}

initializeMessaging().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('FCM Service Worker initialization failed:', error)
})

/**
 * FETCH INTERCEPTION BYPASS
 *
 * Critical: Service Workers and SSE (Server-Sent Events) can encounter issues
 * when the SW intercepts long-running streams it doesn't know how to handle.
 * We explicitly tell the Service Worker to skip interception for API and SSE requests.
 * By not calling event.respondWith(), the browser handles the fetch directly via network.
 */
self.addEventListener('fetch', (event) => {
  const url = event.request.url

  // 1. Never intercept SSE streams
  if (event.request.headers.get('Accept') === 'text/event-stream' || url.includes('/events')) {
    return
  }

  // 2. Never intercept API calls or anything on the api subdomain
  if (url.includes('/api/')) {
    return
  }
})

// Ensure the SW activates immediately without waiting for open tabs to close
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(self.clients.claim())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const link = event.notification.data?.link || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          const clientUrl = new URL(client.url)
          const targetUrl = new URL(link, self.location.origin)

          if (clientUrl.origin === targetUrl.origin) {
            if ('navigate' in client) {
              return client.navigate(targetUrl.toString()).then(() => client.focus())
            }

            return client.focus()
          }
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(link)
      }

      return Promise.resolve()
    }),
  )
})
