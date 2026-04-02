import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useQueueStore } from '@/stores/queue.store'
import { useCapture } from '@/composables/useCapture'
import * as CustomerActions from '@/modules/customer/actions/customer.action'
import type { JoinQueuePayload } from '@/modules/customer/types'
import { useToast } from '@/composables/useToast'

export function useCustomer() {
    const store = useCustomerStore()
    const { entry, position, status, isLoading, error } = storeToRefs(store)
    const router = useRouter()
    const { showToast } = useToast()
    const queueStore = useQueueStore()

    const { isCapturing, hasCaptured, captureElement } = useCapture()

    async function handleJoinQueue(queueId: string, payload: JoinQueuePayload) {
        const result = await store.joinQueue(queueId, payload)
        if (result) {
            router.push({ name: 'customer-waiting', params: { queueId } })
        } else {
            showToast(store.error ?? 'Failed to join queue', { type: 'error' })
        }
        return result
    }

    async function handleJoinByCode(code: string) {
        store.isLoading = true
        store.error = null
        try {
            const result = await CustomerActions.joinByCode(code)
            if (result.found && result.queueId) {
                store.error = null
                router.push({ name: 'customer-join', params: { queueId: result.queueId } })
                return result
            }
            store.error = 'Invalid join code. Please try again.'
            return null
        } catch (e) {
            store.error = e instanceof Error ? e.message : 'Failed to resolve code'
            return null
        } finally {
            store.isLoading = false
        }
    }

    async function handleLeaveQueue() {
        const queueId = router.currentRoute.value.params.queueId
        const success = await store.leaveQueue()
        if (success) {
            showToast('You have left the queue.', { type: 'success' })
            router.push({ name: 'customer-ended', params: { queueId }, query: { reason: 'left' } })
        } else {
            showToast(store.error ?? 'Failed to leave queue', { type: 'error' })
        }
        return success
    }

    async function handleConfirmArrival() {
        const success = await store.confirmArrival()
        if (success) {
            showToast('You have confirmed your arrival.', { type: 'success' })
        } else {
            showToast(store.error ?? 'Failed to confirm arrival', { type: 'error' })
        }
        return success
    }

    async function handleFinishService() {
        const success = await store.finishService()
        if (success) {
            showToast('Service finished! Redirecting...', { type: 'success' })
        } else {
            showToast(store.error ?? 'Failed to finish service', { type: 'error' })
        }
        return success
    }

    async function handleConfirmStillHere() {
        const success = await store.confirmStillHere()
        if (success) {
            showToast("You're back in line!", { type: 'success' })
        } else {
            showToast(store.error ?? 'Failed to confirm status', { type: 'error' })
        }
        return success
    }

    async function saveTicketAsImage() {
        if (!entry.value) return
        const qName = queueStore.activeQueue?.name ?? 'Your Queue'
        await captureElement(
            'capture-ticket',
            `queuebuzz-ticket-${entry.value.ticketNo}.png`,
            {
                title: 'My Queue Ticket',
                text: `I'm waiting at ${qName}. My ticket is #${entry.value.ticketNo}.`
            }
        )
    }

    return {
        entry,
        position,
        status,
        isLoading,
        error,
        isJoined: computed(() => !!entry.value),
        ahead: computed(() => (position.value != null ? Math.max(0, position.value - 1) : null)),
        estWaitMin: computed(() => {
            const pos = position.value
            if (pos == null) return null
            const aheadVal = Math.max(0, pos - 1)
            const avgServiceMins = useQueueStore().activeQueue?.avgServiceMins ?? 0
            return aheadVal * avgServiceMins
        }),

        // Party Constraints (from queue store)
        canJoinWithParty: computed(() => useQueueStore().canJoinWithParty),
        maxAllowedPartySize: computed(() => useQueueStore().maxAllowedPartySize),

        handleJoinQueue,
        joinByCode: handleJoinByCode,
        clearError: () => (store.error = null),
        leaveQueue: handleLeaveQueue,
        confirmStillHere: handleConfirmStillHere,
        confirmArrival: () => handleConfirmArrival(),
        finishService: () => handleFinishService(),

        submitRating: async (rating: number) => {
            const success = await store.submitRating(rating)
            if (success) {
                showToast('Thank you for your feedback!', { type: 'success' })
            } else {
                showToast(store.error ?? 'Failed to submit rating', { type: 'error' })
            }
            return success
        },
        fetchEntry: () => store.fetchEntry(),
        revalidate: (id: string) => store.revalidate(id),
        attemptSessionRecovery: () => store.attemptSessionRecovery(),
        connectEvents: (id: string) => store.connectToEvents(id),
        disconnectEvents: () => store.disconnectLiveUpdates(),

        // Capture logic
        isSaving: isCapturing,
        isSaved: hasCaptured,
        saveTicketAsImage
    }
}


