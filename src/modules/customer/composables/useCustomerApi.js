/**
 * @composable useCustomerApi
 * @description API stub for customer-facing queue operations.
 * Phase 2: replace each stub function body with real fetch/axios call.
 */
import { ref } from 'vue'

export function useCustomerApi() {
  const isLoading = ref(false)
  const error = ref(null)

  async function joinQueue(payload) {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/queues/:id/join
      await new Promise((r) => setTimeout(r, 600))
      return { ticketNumber: 'Q-0042', position: 4, ahead: 3, estWaitMin: 12 }
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function checkGeofence() {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: GET /api/queues/:id/geofence-check
      await new Promise((r) => setTimeout(r, 300))
      return { isWithinRange: true, distanceMeters: 45 }
    } catch (e) {
      error.value = e.message
      return { isWithinRange: true, distanceMeters: 0 }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchWaitingStatus(ticketId) {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: GET /api/tickets/:id/status
      await new Promise((r) => setTimeout(r, 500))
      return {
        ticketNumber: 'Q-0042',
        position: 4,
        ahead: 3,
        estWaitMin: 12,
        totalInQueue: 23,
        servedCount: 8,
        status: 'waiting', // 'waiting' | 'idle' | 'called' | 'served'
        buzzEnabled: true,
      }
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function confirmStillHere(ticketId) {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/tickets/:id/confirm
      await new Promise((r) => setTimeout(r, 300))
      return { success: true }
    } catch (e) {
      error.value = e.message
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  async function confirmArrival(ticketId) {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/tickets/:id/arrived
      await new Promise((r) => setTimeout(r, 300))
      return { success: true }
    } catch (e) {
      error.value = e.message
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  async function leaveQueue(ticketId) {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/tickets/:id/leave
      await new Promise((r) => setTimeout(r, 300))
      return { success: true }
    } catch (e) {
      error.value = e.message
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  async function submitRating(ticketId, rating) {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/tickets/:id/rating
      await new Promise((r) => setTimeout(r, 300))
      return { success: true }
    } catch (e) {
      error.value = e.message
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  async function joinByCode(code) {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/queues/join-by-code
      await new Promise((r) => setTimeout(r, 700))
      return { found: true, queueName: 'Chai Point · Koramangala', queueId: 'stub-id' }
    } catch (e) {
      error.value = e.message
      return { found: false }
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    joinQueue,
    checkGeofence,
    fetchWaitingStatus,
    confirmStillHere,
    confirmArrival,
    leaveQueue,
    submitRating,
    joinByCode,
  }
}
