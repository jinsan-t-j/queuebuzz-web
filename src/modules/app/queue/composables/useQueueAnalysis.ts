import { computed, ref, watch } from 'vue'

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

function buildWeeklyBoundaries(
  now: Date,
  createdAt?: Date,
): { labels: string[]; boundaries: Date[] } {
  const labels: string[] = []
  const boundaries: Date[] = []

  let daysToShow = 7
  if (createdAt && !Number.isNaN(createdAt.getTime())) {
    const utcCreated = Date.UTC(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate())
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    const diffDays = Math.floor((utcNow - utcCreated) / (1000 * 60 * 60 * 24)) + 1
    daysToShow = Math.max(1, diffDays)
  }

  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const dayOfWeek = d.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      labels.push(dayName)
      boundaries.push(d)
    }
  }
  return { labels, boundaries }
}

function distributeIntoBuckets(
  entries: { servedAt?: string }[],
  boundaries: Date[],
  isWeekly = false,
): number[] {
  const bars = new Array(boundaries.length).fill(0)
  const withTimestamp = entries.filter((e) => e.servedAt)
  const bucketSize = isWeekly ? 24 * 3600 * 1000 : 3600000

  for (const entry of withTimestamp) {
    const servedTime = new Date(entry.servedAt).getTime()
    for (let i = boundaries.length - 1; i >= 0; i--) {
      const currentBound = boundaries[i].getTime()
      if (servedTime >= currentBound) {
        const nextBound =
          i < boundaries.length - 1 ? boundaries[i + 1].getTime() : currentBound + bucketSize

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
  const viewType = ref<'day' | 'week'>('day')

  watch(
    () => store.activeQueue,
    (queue) => {
      if (queue?.createdAt) {
        const durationMs = new Date().getTime() - new Date(queue.createdAt).getTime()
        if (durationMs > 24 * 3600 * 1000) {
          viewType.value = 'week'
        } else {
          viewType.value = 'day'
        }
      }
    },
    { immediate: true },
  )

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
   * Build an array of hourly or weekly buckets.
   */
  const buckets = computed(() => {
    const queue = store.activeQueue
    if (!queue) return { labels: [] as string[], bars: [] as number[] }

    const isWeekly = viewType.value === 'week'
    const now = new Date()
    const { labels, boundaries } = isWeekly
      ? buildWeeklyBoundaries(now, queue.createdAt ? new Date(queue.createdAt) : undefined)
      : buildHourlyBoundaries(now)
    const bars = distributeIntoBuckets(servedEntries.value, boundaries, isWeekly)

    return { labels, bars }
  })

  const chartLabels = computed(() => buckets.value.labels)
  const chartBars = computed(() => buckets.value.bars)

  /* ── Trend (Current hour so far vs Previous full hour) ───────── */
  const trend = computed<TrendSummary>(() => {
    const bars = chartBars.value
    if (bars.length < 2) return { text: 'No data', direction: 'flat' }

    const current = bars.at(-1) ?? 0
    const previous = bars.at(-2) ?? 0
    const label = viewType.value === 'week' ? 'yesterday' : 'last hr'

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

    const text = diff === 0 ? `Same as ${label}` : `${pct}% ${direction} vs ${label}`

    return { text, direction }
  })

  return {
    servedTodayCount,
    completionRatePercent,
    chartLabels,
    chartBars,
    trend,
    viewType,
  }
}
