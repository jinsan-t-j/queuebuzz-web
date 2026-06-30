/**
 * @composable usePrefetch
 * @description Background prefetcher for route chunks and heavy async components.
 * Uses requestIdleCallback to avoid competing with the current page's paint/hydration.
 * Falls back to a 2s setTimeout when requestIdleCallback is unavailable (Safari < 17).
 */

type ChunkImporter = () => Promise<unknown>

const prefetched = new Set<string>()

function scheduleIdle(fn: () => void): void {
  if ('requestIdleCallback' in globalThis) {
    globalThis.requestIdleCallback(fn, { timeout: 4000 })
  } else {
    globalThis.setTimeout(fn, 2000)
  }
}

/**
 * Prefetch a list of dynamic imports during browser idle time.
 * Each import is only triggered once per session (deduped by string key).
 *
 * @param chunks - Map of label → dynamic import function
 *
 * @example
 * usePrefetch({
 *   CreateQueueView: () => import('@/modules/app/queue/views/CreateQueueView.vue'),
 *   CreateQueueForm: () => import('@/modules/app/queue/components/CreateQueueForm.vue'),
 * })
 */
export function usePrefetch(chunks: Record<string, ChunkImporter>): void {
  if (import.meta.env.SSR) return
  scheduleIdle(() => {
    for (const [key, importer] of Object.entries(chunks)) {
      if (prefetched.has(key)) continue
      prefetched.add(key)
      // Fire-and-forget — we only need Vite/webpack to cache the chunk
      importer().catch(() => {
        // Chunk fetch failed (offline/network error); allow retry next time
        prefetched.delete(key)
      })
    }
  })
}
