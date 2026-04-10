/**
 * @file env.config.ts
 * @description Centralized environment variable access.
 *
 * Vite statically replaces `import.meta.env.VITE_*` at transform time.
 * Each variable must be accessed individually — passing the whole
 * `import.meta.env` object to a function (e.g. yup.validateSync)
 * can produce stale values from Vite's module cache.
 */

export const ENV = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  VITE_FIREBASE_VAPID_KEY: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
} as const

if (import.meta.env.DEV && typeof window !== 'undefined') {
  const missing = Object.entries(ENV)
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error(`⚠️ Missing environment variables: ${missing.join(', ')}`)
  }
}

export const FIREBASE_CONFIG = {
  apiKey: ENV.VITE_FIREBASE_API_KEY,
  authDomain: ENV.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: ENV.VITE_FIREBASE_PROJECT_ID,
  storageBucket: ENV.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.VITE_FIREBASE_APP_ID,
} as const
