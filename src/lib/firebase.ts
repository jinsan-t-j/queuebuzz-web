/**
 * @lib firebase
 * @description Standard Firebase initialization for FCM.
 */
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

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
    const messaging = getMessaging(app)

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
