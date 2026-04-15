/**
 * @file firebase-messaging-sw.js
 * @description Service worker for Firebase Cloud Messaging (FCM) background notifications.
 * Uses Firebase v11 modular SDK, bundled by Vite.
 */

import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

onBackgroundMessage(messaging, (payload) => {
  const { title, options } = getNotificationDetails(payload)
  void self.registration.showNotification(title, options)
})

/** @param {import('firebase/messaging/sw').MessagePayload} payload */
function getNotificationDetails(payload) {
  const link = payload?.fcmOptions?.link || payload?.data?.link || '/'

  return {
    title: payload?.notification?.title || payload?.data?.title || 'Wait list update',
    options: {
      body: payload?.notification?.body || payload?.data?.body,
      icon: payload?.notification?.image || '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      tag: payload?.data?.event || 'queue-buzz',
      vibrate: [200, 100, 200],
      data: { ...payload?.data, link },
    },
  }
}

// Activate immediately without waiting for open tabs to close
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const link = event.notification.data?.link || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const targetUrl = new URL(link, self.location.origin)

      for (const client of clients) {
        if (!('focus' in client)) continue

        const clientUrl = new URL(client.url)
        if (clientUrl.origin !== targetUrl.origin) continue

        if ('navigate' in client) {
          return client.navigate(targetUrl.toString()).then(() => client.focus())
        }
        return client.focus()
      }

      return self.clients.openWindow?.(link) ?? Promise.resolve()
    }),
  )
})
