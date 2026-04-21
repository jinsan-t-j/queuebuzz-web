import { ref } from 'vue'
import type { QueueHistoryItem } from '@/modules/app/history/types'
import { fetchHistory, fetchHistoryDetail } from '../actions/history.action'

export function useHistory() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const queues = ref<QueueHistoryItem[]>([])
  const totalCount = ref(0)
  const totalPages = ref(1)
  const summary = ref({
    totalSessions: 0,
    totalServed: 0,
    avgSessionLength: '0m',
  })
  const currentPage = ref(1)
  const searchQuery = ref('')
  const activeFilter = ref('all')

  async function fetchHistoryData() {
    isLoading.value = true
    error.value = null
    try {
      const result = await fetchHistory({
        page: currentPage.value,
        limit: 10,
        search: searchQuery.value,
        filter: activeFilter.value === 'all' ? undefined : activeFilter.value,
      })

      if (result) {
        queues.value = result.data || []
        totalCount.value = result.totalCount || 0
        totalPages.value = result.totalPages || 1
        summary.value = result.summary || {
          totalSessions: 0,
          totalServed: 0,
          avgSessionLength: '0m',
        }
      }

      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load history'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchHistoryDetailData(id: string) {
    isLoading.value = true
    error.value = null
    try {
      return await fetchHistoryDetail(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load queue history'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function handleFilterChange(val: string) {
    activeFilter.value = val
    currentPage.value = 1
    fetchHistoryData()
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      fetchHistoryData()
    }
  }

  return {
    isLoading,
    error,
    queues,
    totalCount,
    totalPages,
    summary,
    currentPage,
    searchQuery,
    activeFilter,
    fetchHistory: fetchHistoryData,
    fetchHistoryDetail: fetchHistoryDetailData,
    handleFilterChange,
    goToPage,
  }
}
