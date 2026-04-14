import { ref, computed, onScopeDispose } from 'vue'
import { useRouter } from 'vue-router'
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'
import { useQueueAnalysis } from './useQueueAnalysis'
import { ENTRY_STATUS } from '@/modules/app/queue/constants'
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

  const filteredActiveEntries = computed(() => {
    const activeOnly = store.entries.filter((e) =>
      (
        [
          ENTRY_STATUS.WAITING,
          ENTRY_STATUS.CALLED,
          ENTRY_STATUS.ARRIVED,
          ENTRY_STATUS.IDLE,
        ] as string[]
      ).includes(e.status),
    )
    if (!debouncedSearchQuery.value) return activeOnly
    const q = debouncedSearchQuery.value.toLowerCase()
    return activeOnly.filter((e) => e.name.toLowerCase().includes(q))
  })

  const filteredServedEntries = computed(() => {
    // Show everything that isn't active in the history (Served, Left)
    const historicalOnly = store.entries.filter(
      (e) =>
        !(
          [
            ENTRY_STATUS.WAITING,
            ENTRY_STATUS.CALLED,
            ENTRY_STATUS.ARRIVED,
            ENTRY_STATUS.IDLE,
          ] as string[]
        ).includes(e.status),
    )

    if (!debouncedSearchQuery.value) return historicalOnly
    const q = debouncedSearchQuery.value.toLowerCase()
    return historicalOnly.filter((e) => e.name.toLowerCase().includes(q))
  })

  const calledGuests = computed(() => store.entries.filter((e) => e.status === ENTRY_STATUS.CALLED))

  const queueUrl = computed(() => {
    if (!store.activeQueue) return ''

    const route = router.resolve({
      name: 'customer-join',
      params: {
        queueId: store.activeQueue.id,
        code: store.activeQueue.joinCode,
      },
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

  onScopeDispose(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
  })

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

    if (store.waitingCount === 0) {
      showToast('No guests are currently waiting in the queue.', { type: 'info' })
      return
    }

    if (store.activeQueue.strictQueueMode && calledGuests.value.length > 0) {
      showToast('Please mark all summoned guests as served to continue.', { type: 'warning' })
      return
    }

    const success = await store.callEntry()
    if (success) {
      showToast(`Calling next guest...`)
    } else if (store.error) {
      const isConflict = store.error.toLowerCase().includes('serve the current guest')
      showToast(
        isConflict ? 'Please mark all summoned guests as served to continue.' : store.error,
        { type: isConflict ? 'warning' : 'error' },
      )
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
    const success = await store.callEntry(entryId)
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

  async function handleEnableNotifications(queueId?: string) {
    const qid = queueId || store.activeQueue?.id
    if (!qid) {
      showToast('Failed to enable notifications. No active queue found.', { type: 'error' })
      return false
    }

    if (!('Notification' in window)) {
      showToast('Notifications are not supported by this browser.', { type: 'warning' })
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        if (permission === 'denied') {
          showToast('Notification permission denied. Please enable in browser settings.', {
            type: 'warning',
          })
        }
        return false
      }

      const success = await store.registerHostFCM(qid)
      if (!success) {
        showToast(store.error || 'Failed to enable notifications. Please try again.', {
          type: 'error',
        })
        return false
      }

      showToast('Notifications enabled successfully.')
      return true
    } catch (e: unknown) {
      const errorMessage =
        e instanceof DOMException
          ? `Notification service error: ${e.message}`
          : 'Failed to set up notifications. Please try again.'

      store.error = errorMessage
      showToast(errorMessage, { type: 'error' })
      return false
    }
  }

  function disposeLiveQueue() {
    store.disconnectLiveUpdates()
  }

  return {
    // Store-backed state (reactive via Pinia)
    activeQueue: computed(() => store.activeQueue),
    entries: computed(() => store.entries),
    calledGuests,
    isPaused: computed(() => store.isPaused),
    waitingCount: computed(() => store.waitingCount),
    avgWaitTime: computed(() => store.avgWaitTime),
    isLoading: computed(() => store.isLoading),
    isFcmRegistering: computed(() => store.isFcmRegistering),
    error: computed(() => store.error),
    streamState: computed(() => store.streamState),
    isStreamConnected: computed(() => store.isStreamConnected),
    hasHostFcmToken: computed(() => !!store.hostFcmToken),
    queueUrl,

    // Party Constraints
    canJoinWithParty: computed(() => store.canJoinWithParty),
    maxAllowedPartySize: computed(() => store.maxAllowedPartySize),

    // UI state
    showAddGuestModal,
    showStatusUpdateModal,
    statusUpdateMode,
    showInfoModal,
    showSettingsModal,

    // Search
    rawSearchQuery,
    filteredActiveEntries,
    filteredServedEntries,

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
    handleEnableNotifications,
  }
}
