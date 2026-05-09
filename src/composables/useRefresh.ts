import { ref, computed } from 'vue'

const refreshHandler = ref<(() => Promise<unknown>) | null>(null)
const isRefreshing = ref(false)

function onRefresh(handler: (() => Promise<unknown>) | null) {
  refreshHandler.value = handler
}

async function triggerRefresh() {
  if (refreshHandler.value && !isRefreshing.value) {
    isRefreshing.value = true
    try {
      await refreshHandler.value()
    } finally {
      isRefreshing.value = false
    }
  }
}

export function useRefresh() {
  const hasRefreshHandler = computed(() => !!refreshHandler.value)

  return {
    onRefresh,
    triggerRefresh,
    isRefreshing,
    hasRefreshHandler,
  }
}
