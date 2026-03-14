import { ref, shallowRef, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import type {
  LiveQueueEntry,
  LiveQueueGuestInput,
  TrendSummary,
} from '@/types/app'

type SearchEmitter = (value: string) => void

export function useLiveQueue(
  initialEntries: LiveQueueEntry[] = [],
  initialSearchQuery = '',
) {
    const showAddGuestModal = ref(false)
    const { showToast } = useToast()

    // Use shallowRef for the entries array to avoid deep proxy overhead, significantly reducing memory consumption and reactivity tracking
    const guestEntries = shallowRef<LiveQueueEntry[]>([...initialEntries])
    const rawSearchQuery = ref(initialSearchQuery)
    const debouncedSearchQuery = ref(rawSearchQuery.value)
    let searchTimeout: ReturnType<typeof setTimeout> | null = null

    const filteredEntries = computed(() => {
        if (!debouncedSearchQuery.value) return guestEntries.value
        const q = debouncedSearchQuery.value.toLowerCase()
        return guestEntries.value.filter(e => e.name.toLowerCase().includes(q))
    })

    // Pre-calculate count to avoid evaluating array length in template re-renders
    const activeWaitCount = computed(() => filteredEntries.value.length)
    const servedTodayCount = computed(() => guestEntries.value.filter(e => e.status === 'called').length)
    const completionRatePercent = computed(() => {
        const total = guestEntries.value.length
        if (total === 0) return 0
        return Math.round((servedTodayCount.value / total) * 100)
    })

    // Mock queue start time (e.g. 5 hours ago)
    const queueStartTime = new Date()
    queueStartTime.setHours(queueStartTime.getHours() - 5)

    const chartLabels = computed(() => {
        const labels: string[] = []
        const now = new Date()
        const start = new Date(queueStartTime)
        start.setMinutes(0, 0, 0)

        while (start <= now) {
            const h = start.getHours()
            const ampm = h >= 12 ? 'pm' : 'am'
            const h12 = h % 12 || 12
            labels.push(`${h12} ${ampm}`)
            start.setHours(start.getHours() + 1)
        }
        return labels
    })

    const chartBars = computed(() => {
        const count = chartLabels.value.length
        const total = servedTodayCount.value
        const bars: number[] = new Array(count).fill(0)

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

        const currentHour = bars[bars.length - 1]
        const lastHour = bars[bars.length - 2]

        if (lastHour === 0) {
            return {
                text: currentHour > 0 ? '100% vs last hr' : '0% vs last hr',
                direction: currentHour > 0 ? 'up' : 'flat'
            }
        }

        const diff = currentHour - lastHour
        const percent = Math.round((Math.abs(diff) / lastHour) * 100)
        const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'

        return {
            text: `${percent}% vs last hr`,
            direction
        }
    })

    function handleSearchUpdate(val: string, emitSearch?: SearchEmitter) {
        rawSearchQuery.value = val
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }
        searchTimeout = setTimeout(() => {
            debouncedSearchQuery.value = val
        }, 300)

        if (emitSearch) emitSearch(val)
    }

    function handleAddGuestSubmit(values: LiveQueueGuestInput) {
        // Since we use shallowRef, we reassign the array to trigger reactivity efficiently
        guestEntries.value = [
            ...guestEntries.value,
            {
                id: Date.now(),
                position: guestEntries.value.length + 1,
                name: values.name,
                partySize: 1,
                waitTime: '0m',
                status: 'waiting'
            }
        ]
        showAddGuestModal.value = false

        showToast(`${values.name} added to queue.`)
    }

    return {
        showAddGuestModal,
        showToast,
        guestEntries,
        rawSearchQuery,
        debouncedSearchQuery,
        filteredEntries,
        activeWaitCount,
        servedTodayCount,
        completionRatePercent,
        chartLabels,
        chartBars,
        computedTrend,
        handleSearchUpdate,
        handleAddGuestSubmit
    }
}
