/**
 * @composable useCustomer
 * @description Hook for customer-facing queue operations and state.
 * Bridges the component UI to the Customer store and actions.
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useQueueStore } from '@/stores/queue.store'
import * as CustomerActions from '@/modules/customer/actions/customer.action'
import type { JoinQueuePayload } from '@/modules/customer/types'
import { useToast } from '@/composables/useToast'

export function useCustomer() {
    const store = useCustomerStore()
    const queueStore = useQueueStore()
    const router = useRouter()
    const { showToast } = useToast()

    const isLoading = computed(() => store.isLoading)
    const error = computed(() => store.error)

    /**
     * Join a queue by ID
     */
    async function handleJoinQueue(queueId: string, payload: JoinQueuePayload) {
        store.isLoading = true
        store.error = null
        try {
            const result = await CustomerActions.joinQueue(queueId, payload)
            if (result) {
                store.setTicket(result.id)
                store.currentTicket = {
                    ...result,
                    status: 'waiting',
                    buzzEnabled: true
                }

                router.push({ name: 'customer-waiting' })
                return result
            }
        } catch (e) {
            showToast(error.value, { type: 'error' })
        } finally {
            store.isLoading = false
        }
    }

    /**
     * Join by short join-code
     */
    async function handleJoinByCode(code: string) {
        store.isLoading = true
        store.error = null
        try {
            const result = await CustomerActions.joinByCode(code)
            if (result.found && result.queueId) {
                // Redirect to join view for that queue
                router.push({
                    name: 'customer-join',
                    params: { queueId: result.queueId }
                })
                return result
            } else {
                store.error = 'Invalid join code. Please try again.'
                return null
            }
        } catch (e) {
            store.error = e instanceof Error ? e.message : 'Failed to join by code'
            return null
        } finally {
            store.isLoading = false
        }
    }

    /**
     * Confirm still waiting (anti-idle)
     */
    async function handleConfirmStillHere() {
        if (!store.ticketId) return false
        const success = await store.confirmStillHere()
        if (success) {
            // Re-fetch status to clear idle state
            await store.fetchStatus()
        }
        return success
    }

    /**
     * Leave queue (abandon ticket)
     */
    async function handleLeaveQueue() {
        const success = await store.leaveQueue()
        if (success) {
            router.push('/')
        }
        return success
    }

    return {
        // State
        isLoading,
        error,
        ticket: computed(() => store.currentTicket),
        isJoined: computed(() => store.isJoined),

        // Actions
        handleJoinQueue,
        joinByCode: handleJoinByCode,
        confirmStillHere: handleConfirmStillHere,
        leaveQueue: handleLeaveQueue,
        fetchStatus: () => store.fetchStatus(),
        initialFetch: () => store.initialFetch()
    }
}
