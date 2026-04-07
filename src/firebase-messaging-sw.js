/**
 * @file firebase-messaging-sw.js
 * @description Mandatory service worker for Firebase Cloud Messaging (FCM).
 * This uses the modern Firebase v11 modular SDK and is bundled by Vite.
 */

import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
