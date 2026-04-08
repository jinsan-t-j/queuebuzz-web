import { computed } from 'vue'

import { useQueueStore } from '@/stores/queue.store'
import { ENTRY_STATUS } from '@/modules/app/queue/constants'
import type { TrendSummary } from '@/modules/app/queue/types'

/**
 * @composable useQueueAnalysis
 * @description Derives queue analysis metrics (served count, completion rate,
 * hourly activity chart, trend) purely from the store's entries and activeQueue.
 */
export function useQueueAnalysis() {
  const store = useQueueStore()

  // Single pass: extract served entries once
  const servedEntries = computed(() =>
    store.entries.filter((e) => e.status === ENTRY_STATUS.SERVED),
  )

  const servedTodayCount = computed(() => servedEntries.value.length)

  const completionRatePercent = computed(() => {
    const total = store.entries.length
    if (total === 0) return 0
    return Math.round((servedEntries.value.length / total) * 100)
  })

  /**
   * Build an array of hourly buckets for the last 6 hours.
   */
  const hourlyBuckets = computed(() => {
    const queue = store.activeQueue
    if (!queue) return { labels: [] as string[], bars: [] as number[] }

    const now = new Date()
    const labels: string[] = []
    const boundaries: Date[] = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now)
      d.setHours(now.getHours() - i, 0, 0, 0)

      const h = d.getHours()
      const h12 = h % 12 || 12
      const ampm = h >= 12 ? 'pm' : 'am'

      labels.push(`${h12}${ampm}`)
      boundaries.push(d)
    }

    // Reuse the cached served entries
    const withTimestamp = servedEntries.value.filter((e) => e.servedAt)
    const bars = new Array(labels.length).fill(0)

    for (const entry of withTimestamp) {
      const servedTime = new Date(entry.servedAt!)
      for (let i = boundaries.length - 1; i >= 0; i--) {
        if (servedTime >= boundaries[i]) {
          const nextBound =
            i < boundaries.length - 1
              ? boundaries[i + 1].getTime()
              : boundaries[i].getTime() + 3600000

          if (servedTime.getTime() < nextBound) {
            bars[i]++
          }
          break
        }
      }
    }

    return { labels, bars }
  })

  const chartLabels = computed(() => hourlyBuckets.value.labels)
  const chartBars = computed(() => hourlyBuckets.value.bars)

  /* ── Trend (Current hour so far vs Previous full hour) ───────── */
  const trend = computed<TrendSummary>(() => {
    const bars = chartBars.value
    if (bars.length < 2) return { text: 'No data', direction: 'flat' }

    const current = bars[bars.length - 1]
    const previous = bars[bars.length - 2]

    if (previous === 0) {
      return {
        text: current > 0 ? 'Trending up' : 'No change',
        direction: current > 0 ? 'up' : 'flat',
      }
    }

    const diff = current - previous
    const pct = Math.round((Math.abs(diff) / previous) * 100)
    const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'

    const text = diff === 0 ? 'Same as last hr' : `${pct}% ${direction} vs last hr`

    return { text, direction }
  })

  return {
    servedTodayCount,
    completionRatePercent,
    chartLabels,
    chartBars,
    trend,
  }
}
