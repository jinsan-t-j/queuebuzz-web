/**
 * @composable useCustomerApi
 * @description API stub for customer-facing queue operations.
 * Phase 2: replace each stub function body with real fetch/axios call.
 */
import { ref } from 'vue'
import type {
  GeofenceStatus,
  JoinByCodeResult,
  JoinQueuePayload,
  JoinQueueResult,
  MutationResult,
  WaitingStatus,
} from '@/modules/customer/types'

export function useCustomerApi() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function joinQueue(_payload: JoinQueuePayload): Promise<JoinQueueResult | null> {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/queues/:id/join
      await new Promise((r) => setTimeout(r, 600))
      return { ticketNumber: 'Q-0042', position: 4, ahead: 3, estWaitMin: 12 }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to join queue'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function checkGeofence(): Promise<GeofenceStatus> {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: GET /api/queues/:id/geofence-check
      await new Promise((r) => setTimeout(r, 300))
      return { isWithinRange: true, distanceMeters: 45 }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to check geofence'
      return { isWithinRange: true, distanceMeters: 0 }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchWaitingStatus(_ticketId: string): Promise<WaitingStatus | null> {
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
      error.value = e instanceof Error ? e.message : 'Failed to fetch waiting status'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function confirmStillHere(_ticketId: string): Promise<MutationResult> {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/tickets/:id/confirm
      await new Promise((r) => setTimeout(r, 300))
      return { success: true }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to confirm ticket'
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  async function confirmArrival(_ticketId: string): Promise<MutationResult> {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/tickets/:id/arrived
      await new Promise((r) => setTimeout(r, 300))
      return { success: true }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to confirm arrival'
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  async function leaveQueue(_ticketId: string): Promise<MutationResult> {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/tickets/:id/leave
      await new Promise((r) => setTimeout(r, 300))
      return { success: true }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to leave queue'
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  async function submitRating(_ticketId: string, _rating: number): Promise<MutationResult> {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/tickets/:id/rating
      await new Promise((r) => setTimeout(r, 300))
      return { success: true }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to submit rating'
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  async function joinByCode(_code: string): Promise<JoinByCodeResult> {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: POST /api/queues/join-by-code
      await new Promise((r) => setTimeout(r, 700))
      return { found: true, queueName: 'Chai Point · Koramangala', queueId: 'stub-id' }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to find queue'
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
