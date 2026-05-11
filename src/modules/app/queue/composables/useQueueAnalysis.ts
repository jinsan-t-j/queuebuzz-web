import { computed } from 'vue'

import { ENTRY_STATUS } from '@/modules/app/queue/constants'
import type { TrendSummary } from '@/modules/app/queue/types'
import { useQueueStore } from '@/stores/queue.store'

function buildHourlyBoundaries(now: Date): { labels: string[]; boundaries: Date[] } {
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
  return { labels, boundaries }
}

function distributeIntoBuckets(entries: { servedAt?: string }[], boundaries: Date[]): number[] {
  const bars = new Array(boundaries.length).fill(0)
  const withTimestamp = entries.filter((e) => e.servedAt)

  for (const entry of withTimestamp) {
    const servedTime = new Date(entry.servedAt).getTime()
    for (let i = boundaries.length - 1; i >= 0; i--) {
      const currentBound = boundaries[i].getTime()
      if (servedTime >= currentBound) {
        const nextBound =
          i < boundaries.length - 1 ? boundaries[i + 1].getTime() : currentBound + 3600000

        if (servedTime < nextBound) {
          bars[i]++
        }
        break
      }
    }
  }
  return bars
}

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

    const { labels, boundaries } = buildHourlyBoundaries(new Date())
    const bars = distributeIntoBuckets(servedEntries.value, boundaries)

    return { labels, bars }
  })

  const chartLabels = computed(() => hourlyBuckets.value.labels)
  const chartBars = computed(() => hourlyBuckets.value.bars)

  /* ── Trend (Current hour so far vs Previous full hour) ───────── */
  const trend = computed<TrendSummary>(() => {
    const bars = chartBars.value
    if (bars.length < 2) return { text: 'No data', direction: 'flat' }

    const current = bars.at(-1)
    const previous = bars.at(-2)

    if (previous === 0) {
      return {
        text: current > 0 ? 'Trending up' : 'No change',
        direction: current > 0 ? 'up' : 'flat',
      }
    }

    const diff = current - previous
    const pct = Math.round((Math.abs(diff) / previous) * 100)

    let direction: 'up' | 'down' | 'flat' = 'flat'
    if (diff > 0) direction = 'up'
    else if (diff < 0) direction = 'down'

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
