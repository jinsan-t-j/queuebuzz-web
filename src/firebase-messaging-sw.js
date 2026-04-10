/**
 * @file firebase-messaging-sw.js
 * @description Mandatory service worker for Firebase Cloud Messaging (FCM).
 * This uses the modern Firebase v11 modular SDK and is bundled by Vite.
 */

import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

const FIREBASE_CONFIG_PLACEHOLDER = null

async function initializeMessaging() {
  const config = FIREBASE_CONFIG_PLACEHOLDER
  if (!config) {
    // eslint-disable-next-line no-console
    console.error('FCM: Runtime config not found. Service Worker cannot initialize.')
    return
  }

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
    const notificationTitle = payload.notification?.title || 'Wait list update'
    const notificationOptions = {
      body: payload.notification?.body,
      icon: '/icons/notification-icon.png',
      tag: 'queue-buzz',
      data: payload.data,
      badge: '/icons/badge-icon.png',
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
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
