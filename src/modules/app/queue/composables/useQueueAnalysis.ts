import { computed } from 'vue'
import { useQueueStore } from '@/stores/queue.store'
import type { TrendSummary } from '@/modules/app/queue/types'

/**
 * @composable useQueueAnalysis
 * @description Derives queue analysis metrics (served count, completion rate,
 * hourly activity chart, trend) purely from the store's entries and activeQueue.
 */
export function useQueueAnalysis() {
  const store = useQueueStore()

  const servedTodayCount = computed(() =>
    store.entries.filter((e) => e.status === 'served').length
  )

  const completionRatePercent = computed(() => {
    const total = store.entries.length
    if (total === 0) return 0
    const served = store.entries.filter((e) => e.status === 'served').length
    return Math.round((served / total) * 100)
  })


  /**
   * Build an array of full-hour boundaries between the queue's createdAt
   * and the current time. Each label gets a matching bar that counts
   * entries served within that hour.
   */
  const hourlyBuckets = computed(() => {
    const queue = store.activeQueue
    if (!queue) return { labels: [] as string[], bars: [] as number[] }

    const start = new Date(queue.createdAt)
    start.setMinutes(0, 0, 0) // floor to the hour

    const now = new Date()
    const labels: string[] = []
    const boundaries: Date[] = []

    const cursor = new Date(start)
    while (cursor <= now) {
      const h = cursor.getHours()
      const h12 = h % 12 || 12
      labels.push(`${h12} ${h >= 12 ? 'pm' : 'am'}`)
      boundaries.push(new Date(cursor))
      cursor.setHours(cursor.getHours() + 1)
    }

    // Count served entries per hourly bucket
    const served = store.entries.filter((e) => e.status === 'served' && e.servedAt)
    const bars = new Array(labels.length).fill(0)

    for (const entry of served) {
      const servedTime = new Date(entry.servedAt!)
      // Find which bucket this falls into (last boundary <= servedTime)
      for (let i = boundaries.length - 1; i >= 0; i--) {
        if (servedTime >= boundaries[i]) {
          bars[i]++
          break
        }
      }
    }

    return { labels, bars }
  })

  const chartLabels = computed(() => hourlyBuckets.value.labels)
  const chartBars = computed(() => hourlyBuckets.value.bars)

  /* ── Trend (last hour vs previous hour) ───────── */
  const trend = computed<TrendSummary>(() => {
    const bars = chartBars.value
    if (bars.length < 2) return { text: '0% vs last hr', direction: 'flat' }

    const current = bars[bars.length - 1]
    const previous = bars[bars.length - 2]

    if (previous === 0) {
      return {
        text: current > 0 ? '100% vs last hr' : '0% vs last hr',
        direction: current > 0 ? 'up' : 'flat',
      }
    }

    const diff = current - previous
    const pct = Math.round((Math.abs(diff) / previous) * 100)
    const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'
    return { text: `${pct}% vs last hr`, direction }
  })

  return {
    servedTodayCount,
    completionRatePercent,
    chartLabels,
    chartBars,
    trend,
  }
}
