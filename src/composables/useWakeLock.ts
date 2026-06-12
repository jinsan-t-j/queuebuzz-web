/**
 * @composable useWakeLock
 * @description Keeps the screen awake using the Screen Wake Lock API.
 * Prevents the phone from sleeping while the customer is on waiting/called views,
 * ensuring in-page sound and vibration alerts can fire.
 *
 * Auto-releases on unmount. Re-acquires on visibilitychange (required by spec —
 * wake lock is released when tab goes hidden).
 *
 * Supported: Chrome Android 84+, Safari iOS 16.4+, Edge, Samsung Internet.
 * Graceful no-op on unsupported browsers.
 */
import { onMounted, onUnmounted, ref } from 'vue'

export function useWakeLock() {
  const isActive = ref(false)
  let sentinel: WakeLockSentinel | null = null

  async function request(): Promise<void> {
    if (sentinel || !('wakeLock' in navigator)) return

    try {
      sentinel = await navigator.wakeLock.request('screen')
      isActive.value = true

      sentinel.addEventListener('release', () => {
        sentinel = null
        isActive.value = false
      })
    } catch {
      // Permission denied or browser restriction — silent fallback
      isActive.value = false
    }
  }

  async function release(): Promise<void> {
    if (!sentinel) return

    try {
      await sentinel.release()
    } catch {
      // Already released
    }
    sentinel = null
    isActive.value = false
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && !sentinel) {
      void request()
    }
  }

  onMounted(() => {
    void request()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    void release()
  })

  return { isActive, request, release }
}
