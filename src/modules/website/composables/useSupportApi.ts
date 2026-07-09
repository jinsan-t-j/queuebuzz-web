import { ref } from 'vue'

import { apiClient } from '@/lib/axios'

export function useSupportApi() {
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const error = ref<string | null>(null)

  async function submitSupport(payload: {
    name: string
    email: string
    subject: string
    message: string
  }) {
    isSubmitting.value = true
    error.value = null
    isSuccess.value = false
    try {
      // STUB — replace with: await apiClient.post('/support', payload)
      await apiClient.post('/support', payload)
      isSuccess.value = true
      return true
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      error.value = err.response?.data?.message || err.message || 'Failed to submit support request'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    isSuccess,
    error,
    submitSupport,
  }
}
