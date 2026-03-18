/**
 * @composable useQueueApi
 * @description API stub for queue operations.
 * Phase 2: replace each stub function body with real fetch/axios call.
 */
import { ref } from 'vue'

export function useQueueApi() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchQueueDetail(queueId: string) {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: return await $fetch(`/api/queues/${queueId}`)
      await new Promise(r => setTimeout(r, 600))
      // Mock full queue detail for guest host
      return {
        id: queueId,
        name: 'Morning Consultation',
        status: 'active',
        joinCode: '8X4K2F',
        entries: [
          { id: '1', token: 't1', name: 'Sarah J.', position: 1, status: 'called', partySize: 1, waitTime: '5m' },
          { id: '2', token: 't2', name: 'Michael C.', position: 2, status: 'waiting', partySize: 1, waitTime: '2m' },
        ],
        stats: {
          servedToday: 142,
          avgWait: '12m',
        }
      }
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createQueueEntry(queueId: string, payload: { name: string, contactInfo?: string }) {
    isLoading.value = true
    try {
      // STUB — replace with: return await $fetch(`/api/queues/${queueId}/entries`, { method: 'POST', body: payload })
      await new Promise(r => setTimeout(r, 600))
      return { id: 'stub-new-' + Date.now(), ...payload, status: 'waiting', position: 99, waitTime: '0m' }
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    fetchQueueDetail,
    createQueueEntry,
  }
}
