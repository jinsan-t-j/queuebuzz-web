import { ref, computed, onUnmounted } from 'vue'
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'
import { useQueueAnalysis } from './useQueueAnalysis'
import type { LiveQueueGuestInput } from '@/modules/app/queue/types'
import { UpdateQueuePayload } from '../actions/queue.action'

type SearchEmitter = (value: string) => void

export function useLiveQueue() {
    const store = useQueueStore()
    const { showToast } = useToast()
    const analysis = useQueueAnalysis()

    // UI-only modal state
    const showAddGuestModal = ref(false)
    const showStatusUpdateModal = ref(false)
    const statusUpdateMode = ref<'pause' | 'resume' | 'terminate'>('terminate')
    const showInfoModal = ref(false)
    const showSettingsModal = ref(false)

    // Search
    const rawSearchQuery = ref('')
    const debouncedSearchQuery = ref('')
    let searchTimeout: ReturnType<typeof setTimeout> | null = null

    const filteredEntries = computed(() => {
        if (!debouncedSearchQuery.value) return store.entries
        const q = debouncedSearchQuery.value.toLowerCase()
        return store.entries.filter((e) => e.name.toLowerCase().includes(q))
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
        await store.addQueueEntry(values)
        showAddGuestModal.value = false
        showToast(`${values.name} added to queue.`)
    }

    async function handleCallNext() {
        if (!store.activeQueue) return

        await store.callNext()
        showToast(`Calling next guest...`)
    }

    async function handleStatusUpdateConfirm() {
        if (statusUpdateMode.value === 'pause') {
            await store.pause()
            showToast('Queue paused.')
        } else if (statusUpdateMode.value === 'resume') {
            await store.resume()
            showToast('Queue resumed.')
        } else if (statusUpdateMode.value === 'terminate') {
            await store.terminate()
            showToast('Queue terminated successfully.')
            return true
        }
        showStatusUpdateModal.value = false
        return false
    }

    async function handleCallGuest(entryId: string) {
        await store.callGuest(entryId)
        showToast('Calling guest...')
    }

    async function handleServeGuest(entryId: string) {
        await store.serveGuest(entryId)
        showToast('Guest marked as served.')
    }

    async function handleUpdateSettings(payload: UpdateQueuePayload) {
        const updated = await store.updateQueue(payload)
        if (updated) {
            showToast('Queue settings updated.')
            showSettingsModal.value = false
        } else if (store.error) {
            showToast(store.error, { type: 'error' })
        }
    }

    async function initializeHostQueue() {
        return await store.initializeActiveQueue()
    }

    async function initializeQueueById(queueId: string) {
        return await store.initializeQueueById(queueId)
    }

    function disposeLiveQueue() {
        store.disconnectLiveUpdates()
    }

    onUnmounted(() => {
        disposeLiveQueue()
    })

    return {
        // Store-backed state (reactive via Pinia)
        activeQueue: computed(() => store.activeQueue),
        entries: computed(() => store.entries),
        isPaused: computed(() => store.isPaused),
        waitingCount: computed(() => store.waitingCount),
        avgWaitTime: computed(() => store.avgWaitTime),
        isLoading: computed(() => store.isLoading),
        error: computed(() => store.error),
        streamState: computed(() => store.streamState),
        isStreamConnected: computed(() => store.isStreamConnected),

        // UI state
        showAddGuestModal,
        showStatusUpdateModal,
        statusUpdateMode,
        showInfoModal,
        showSettingsModal,

        // Search
        rawSearchQuery,
        filteredEntries,

        // Analysis (served count, completion rate, chart, trend)
        ...analysis,

        // Actions
        handleSearchUpdate,
        handleAddGuestSubmit,
        handleCallNext,
        handleCallGuest,
        handleServeGuest,
        handleStatusUpdateConfirm,
        handleUpdateSettings,
        initializeHostQueue,
        initializeQueueById,
        disposeLiveQueue,
    }
}
