/**
 * @lib firebase
 * @description Lazy Firebase initialization for FCM.
 */
import type { FirebaseApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null

/**
 * Lazily initialize Firebase app — only on first use.
 */
async function getApp(): Promise<FirebaseApp> {
  if (!app) {
    const { initializeApp } = await import('firebase/app')
    app = initializeApp(firebaseConfig)
  }
  return app
}

/**
 * Capture FCM Token
 * Requires a user gesture (typically handled during the Join Queue flow)
 * and is dependent on browser permissions.
 */
export async function getFCMToken() {
  if (!('Notification' in window)) {
    return null
  }

  try {
    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(await getApp())

    // Recovery of current registration token
    // vapidKey is required for Web Push. Replace with your actual key.
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })

    return token
  } catch {
    return null
  }
}
