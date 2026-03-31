import { ref, computed } from 'vue'
import { RouteLocationResolved, useRouter } from 'vue-router'
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'
import { useQueueAnalysis } from './useQueueAnalysis'
import { QUEUE_ERROR_REASONS } from '@/modules/app/queue/constants'
import type { LiveQueueGuestInput, UpdateQueuePayload } from '@/modules/app/queue/types'

type SearchEmitter = (value: string) => void

export function useLiveQueue() {
    const store = useQueueStore()
    const router = useRouter()
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

    const queueUrl = computed(() => {
        let route: RouteLocationResolved
        if (!store.activeQueue) {
            route = router.resolve({ 
              name: 'guest-host-queue-ended', 
              query: { reason: QUEUE_ERROR_REASONS.TERMINATED } 
            })
        }

        route = router.resolve({
            name: 'customer-join',
            params: {
                queueId: store.activeQueue.id,
                code: store.activeQueue.joinCode
            }
        })

        const base = window.location.origin
        return `${base}${route.fullPath}`
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
        const success = await store.addQueueEntry(values)
        if (success) {
            showAddGuestModal.value = false
            showToast(`${values.name} added to queue.`)
        } else if (store.error) {
            showToast(store.error, { type: 'error' })
        }
    }

    async function handleCallNext() {
        if (!store.activeQueue) return

        const success = await store.callNext()
        if (success) {
            showToast(`Calling next guest...`)
        } else if (store.error) {
            showToast(store.error, { type: 'error' })
        }
    }

    async function handleStatusUpdateConfirm(): Promise<boolean> {
        if (statusUpdateMode.value === 'pause') {
            const success = await store.pause()
            if (success) {
                showToast('Queue paused.')
                showStatusUpdateModal.value = false
                return true
            }
        } else if (statusUpdateMode.value === 'resume') {
            const success = await store.resume()
            if (success) {
                showToast('Queue resumed.')
                showStatusUpdateModal.value = false
                return true
            }
        } else if (statusUpdateMode.value === 'terminate') {
            const success = await store.terminate()
            if (success) {
                showToast('Queue terminated successfully.')
                return true
            }
        }

        if (store.error) {
            showToast(store.error, { type: 'error' })
        }
        return false
    }

    async function handleCallGuest(entryId: string) {
        const success = await store.callGuest(entryId)
        if (success) {
            showToast('Calling guest...')
        } else if (store.error) {
            showToast(store.error, { type: 'error' })
        }
    }

    async function handleServeGuest(entryId: string) {
        const success = await store.serveGuest(entryId)
        if (success) {
            showToast('Guest marked as served.')
        } else if (store.error) {
            showToast(store.error, { type: 'error' })
        }
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

    async function revalidateQueue(queueId: string) {
        return await store.revalidate(queueId)
    }

    function disposeLiveQueue() {
        store.disconnectLiveUpdates()
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
        streamState: computed(() => store.streamState),
        isStreamConnected: computed(() => store.isStreamConnected),
        queueUrl,

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
        revalidateQueue,
        disposeLiveQueue,
    }
}
