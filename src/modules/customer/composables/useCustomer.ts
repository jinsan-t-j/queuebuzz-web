import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import * as CustomerActions from '@/modules/customer/actions/customer.action'
import type { JoinQueuePayload } from '@/modules/customer/types'
import { useToast } from '@/composables/useToast'

export function useCustomer() {
    const store = useCustomerStore()
    const router = useRouter()
    const { showToast } = useToast()

    async function handleJoinQueue(queueId: string, payload: JoinQueuePayload) {
        const result = await store.joinQueue(queueId, payload)
        if (result) {
            router.push({ name: 'customer-waiting' })
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
        const success = await store.leaveQueue()
        if (success) router.push('/')
        return success
    }

    async function handleConfirmStillHere() {
        const success = await store.confirmStillHere()
        if (success) await store.fetchEntry()
        return success
    }

    return {
        entry: computed(() => store.entry),
        position: computed(() => store.position),
        ahead: computed(() => store.ahead),
        estWaitMin: computed(() => store.estWaitMin),
        status: computed(() => store.status),
        isJoined: computed(() => store.isJoined),
        isLoading: computed(() => store.isLoading),
        error: computed(() => store.error),
        handleJoinQueue,
        joinByCode: handleJoinByCode,
        leaveQueue: handleLeaveQueue,
        confirmStillHere: handleConfirmStillHere,

        confirmArrival: () => store.confirmArrival(),
        submitRating: (rating: number) => store.submitRating(rating),
        fetchEntry: () => store.fetchEntry(),
        revalidate: (id: string) => store.revalidate(id),
        attemptSessionRecovery: () => store.attemptSessionRecovery(),
        connectEvents: (id: string) => store.connectToEvents(id),
        disconnectEvents: () => store.disconnectLiveUpdates(),
    }
}


