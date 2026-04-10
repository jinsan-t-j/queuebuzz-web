/**
 * @lib firebase-runtime-config
 * @description Loads Firebase config from a runtime-served JSON file.
 */

export interface FirebaseRuntimeConfig {
  apiBaseUrl: string
  firebaseApiKey: string
  firebaseAuthDomain: string
  firebaseProjectId: string
  firebaseStorageBucket: string
  firebaseMessagingSenderId: string
  firebaseAppId: string
  firebaseVapidKey: string
}

const RUNTIME_CONFIG_PATH = '/firebase-config.json'

let runtimeConfigPromise: Promise<FirebaseRuntimeConfig> | null = null

async function fetchRuntimeConfig(): Promise<FirebaseRuntimeConfig> {
  const response = await fetch(`${RUNTIME_CONFIG_PATH}?t=${Date.now()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to load Firebase runtime config: ${response.status}`)
  }

  return response.json()
}

export function loadFirebaseRuntimeConfig(force = false): Promise<FirebaseRuntimeConfig> {
  if (!runtimeConfigPromise || force) {
    runtimeConfigPromise = fetchRuntimeConfig()
  }

  return runtimeConfigPromise
}
