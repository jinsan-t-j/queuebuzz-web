import { ref, computed } from 'vue'
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'
import type { LiveQueueEntry, LiveQueueGuestInput, TrendSummary } from '@/modules/app/queue/types'

type SearchEmitter = (value: string) => void

export function useLiveQueue() {
  const store = useQueueStore()
  const { showToast } = useToast()

  // UI-only modal state
  const showAddGuestModal = ref(false)
  const showTerminateModal = ref(false)
  const showInfoModal = ref(false)

  // Search
  const rawSearchQuery = ref('')
  const debouncedSearchQuery = ref('')
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const filteredEntries = computed(() => {
    if (!debouncedSearchQuery.value) return store.entries
    const q = debouncedSearchQuery.value.toLowerCase()
    return store.entries.filter((e) => e.displayName.toLowerCase().includes(q))
  })

  // Stats (stub — will come from WebSocket / API later)
  const servedTodayCount = ref(0)
  const completionRatePercent = ref(0)

  // Chart data (mock, based on a 5-hour window)
  const queueStartTime = new Date()
  queueStartTime.setHours(queueStartTime.getHours() - 5)

  const chartLabels = computed(() => {
    const labels: string[] = []
    const now = new Date()
    const start = new Date(queueStartTime)
    start.setMinutes(0, 0, 0)

    while (start <= now) {
      const h = start.getHours()
      const h12 = h % 12 || 12
      labels.push(`${h12} ${h >= 12 ? 'pm' : 'am'}`)
      start.setHours(start.getHours() + 1)
    }
    return labels
  })

  const chartBars = computed(() => {
    const count = chartLabels.value.length
    const total = servedTodayCount.value || 10
    const bars = new Array(count).fill(0)

    if (total > 0 && count > 0) {
      let remaining = total
      for (let i = 0; i < count - 1; i++) {
        const fraction = (Math.sin(i) + 1) / 2
        const max = Math.ceil((total / count) * 1.5)
        const actual = Math.min(Math.floor(fraction * max), remaining)
        bars[i] = actual
        remaining -= actual
      }
      bars[count - 1] = remaining
    }
    return bars
  })

  const computedTrend = computed<TrendSummary>(() => {
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
    const percent = Math.round((Math.abs(diff) / previous) * 100)
    const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'
    return { text: `${percent}% vs last hr`, direction }
  })

  // Actions
  function handleSearchUpdate(val: string, emitSearch?: SearchEmitter) {
    rawSearchQuery.value = val
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      debouncedSearchQuery.value = val
    }, 300)
    emitSearch?.(val)
  }

  async function handleAddGuestSubmit(values: LiveQueueGuestInput) {
    // Stub — real add will come via WebSocket push after API call
    showAddGuestModal.value = false
    showToast(`${values.name} added to queue.`)
  }

  async function handleCallNext() {
    if (!store.activeQueue) return

    await store.callNext()
    showToast(`Calling next guest...`)
  }

  async function handlePauseToggle() {
    if (store.isPaused) {
      await store.resume()
      showToast('Queue resumed.')
    } else {
      await store.pause()
      showToast('Queue paused.')
    }
  }

  async function handleTerminateQueue() {
    await store.terminate()
    showToast('Queue terminated successfully.')
    return true
  }

  return {
    // Store-backed state (reactive via Pinia)
    activeQueue: computed(() => store.activeQueue),
    entries: computed(() => store.entries),
    isPaused: computed(() => store.isPaused),
    waitingCount: computed(() => store.waitingCount),
    avgWaitTime: computed(() => store.avgWaitTime),
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),

    // UI state
    showAddGuestModal,
    showTerminateModal,
    showInfoModal,

    // Search
    rawSearchQuery,
    filteredEntries,

    // Stats & Charts
    servedTodayCount,
    completionRatePercent,
    chartLabels,
    chartBars,
    computedTrend,

    // Actions
    handleSearchUpdate,
    handleAddGuestSubmit,
    handleCallNext,
    handlePauseToggle,
    handleTerminateQueue,
  }
}
