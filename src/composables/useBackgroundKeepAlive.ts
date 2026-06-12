/**
 * @composable useBackgroundKeepAlive
 * @description Prevents browser tab suspension by playing a silent audio loop.
 *
 * When a user switches to another app, browsers throttle inactive tabs within
 * ~30-60s (killing setInterval, AudioContext, SSE). This composable plays an
 * inaudible tone via HTMLAudioElement, signaling the browser the tab is
 * "actively playing media" — preventing suspension.
 *
 * - Uses a tiny inline silent WAV (no network request)
 * - Starts when tab goes hidden, stops when visible (saves battery)
 * - Sets a global flag `__qb_keepalive_active` so the SSE layer can skip
 *   its disconnect-on-hidden behavior
 * - Cleans up on unmount
 */
import { onMounted, onUnmounted, ref } from 'vue'

// 1-second silent WAV at 8kHz mono — 8044 bytes as base64 data URI
// Generated programmatically: 44-byte RIFF header + 8000 zero samples
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQgAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

declare global {
  var __qb_keepalive_active: boolean
}

export function useBackgroundKeepAlive() {
  const isRunning = ref(false)
  let audio: HTMLAudioElement | null = null

  function createAudio(): HTMLAudioElement {
    const el = new Audio(SILENT_WAV)
    el.loop = true
    el.volume = 0.01 // Near-silent but non-zero (some browsers ignore 0)
    return el
  }

  function start() {
    if (audio || isRunning.value) return

    try {
      audio = createAudio()
      const playPromise = audio.play()
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay blocked — will retry on next user gesture
          cleanup()
        })
      }
      isRunning.value = true
      globalThis.__qb_keepalive_active = true
    } catch {
      cleanup()
    }
  }

  function stop() {
    cleanup()
  }

  function cleanup() {
    if (audio) {
      audio.pause()
      audio.src = ''
      audio = null
    }
    isRunning.value = false
    globalThis.__qb_keepalive_active = false
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      start()
    } else {
      stop()
    }
  }

  onMounted(() => {
    // Start immediately to ensure the audio element is "warmed up" by user gesture context
    // It will be paused when visible and restarted when hidden
    globalThis.__qb_keepalive_active = false
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    cleanup()
  })

  return { isRunning, start, stop }
}
