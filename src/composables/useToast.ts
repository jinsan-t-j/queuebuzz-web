import { ref } from 'vue'

import type { ToastOptions, ToastType } from '@/types/app'

const isVisible = ref(false)
const message = ref('')
const type = ref<ToastType>('success')
let hideTimeout: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function showToast(msg: string, options: ToastOptions = {}) {
    message.value = msg
    type.value = options.type ?? 'success'
    isVisible.value = true

    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }

    hideTimeout = setTimeout(() => {
      isVisible.value = false
      hideTimeout = null
    }, options.duration ?? 3000)
  }

  function hideToast() {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
    isVisible.value = false
  }

  return {
    isVisible,
    message,
    type,
    showToast,
    hideToast,
  }
}
