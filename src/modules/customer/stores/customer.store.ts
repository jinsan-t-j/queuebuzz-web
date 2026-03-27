import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JoinQueuePayload, WaitingStatus } from '@/modules/customer/types'
import * as CustomerActions from '@/modules/customer/actions/customer.action'

/**
 * @store useCustomerStore
 * @description Manages the customer's own ticket state and interactions while waiting.
 */
export const useCustomerStore = defineStore('customer', () => {
    // State
    const ticketId = ref<string | null>(null)
    const currentTicket = ref<WaitingStatus | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const isJoined = computed(() => !!ticketId.value)
    const ticketStatus = computed(() => currentTicket.value?.status || 'idle')
    const position = computed(() => currentTicket.value?.position || 0)
    const ahead = computed(() => currentTicket.value?.ahead || 0)
    const estWaitMin = computed(() => currentTicket.value?.estWaitMin || 0)

    // Actions
    function setTicket(id: string) {
        ticketId.value = id
        localStorage.setItem('qb_ticket_id', id)
    }

    function clearTicket() {
        ticketId.value = null
        currentTicket.value = null
        localStorage.removeItem('qb_ticket_id')
    }

    async function fetchStatus() {
        if (!ticketId.value) return

        isLoading.value = true
        error.value = null
        try {
            const status = await CustomerActions.fetchWaitingStatus(ticketId.value)
            if (status) {
                currentTicket.value = status
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch status'
        } finally {
            isLoading.value = false
        }
    }

    async function initialFetch() {
        const storedId = localStorage.getItem('qb_ticket_id')
        if (storedId) {
            ticketId.value = storedId
            await fetchStatus()
        }
    }

    async function joinQueue(queueId: string, payload: JoinQueuePayload) {
        isLoading.value = true
        error.value = null
        try {
            const result = await CustomerActions.joinQueue(queueId, payload)
            if (result) {
                setTicket(result.id)
                currentTicket.value = {
                    ...result,
                    status: 'waiting',
                    totalInQueue: result.position + 5,
                    servedCount: 10,
                    buzzEnabled: true
                }
                return result
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Join failed'
        } finally {
            isLoading.value = false
        }
    }

    async function confirmStillHere() {
        if (!ticketId.value) return { success: false }
        return await CustomerActions.confirmStillHere(ticketId.value)
    }

    async function leaveQueue() {
        if (!ticketId.value) return false
        const result = await CustomerActions.leaveQueue(ticketId.value)
        if (result.success) {
            clearTicket()
        }
        return result.success
    }

    return {
        // State
        ticketId,
        currentTicket,
        isLoading,
        error,

        // Getters
        isJoined,
        ticketStatus,
        position,
        ahead,
        estWaitMin,

        // Actions
        setTicket,
        clearTicket,
        fetchStatus,
        initialFetch,
        joinQueue,
        confirmStillHere,
        leaveQueue
    }
})
