/**
 * @composable useHistoryApi
 * @description API stub for queue history detail operations.
 * Phase 2: replace each stub function body with real fetch/axios call.
 */
import { ref } from 'vue'
import type { HistoryDetail } from '@/types/app'

export function useHistoryApi() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchHistoryDetail(_id: string): Promise<HistoryDetail | null> {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: return await $fetch(`/api/history/${id}`)
      await new Promise((r) => setTimeout(r, 700))
      return {
        queueName: 'Morning Consultation',
        date: 'Tuesday, 10 June 2025',
        timeRange: '9:14 AM – 12:38 PM',
        status: 'Closed',
        stats: {
          served: 47,
          avgWait: '6m 14s',
          peakConcurrent: 23,
          droppedNoShow: 4,
        },
        entries: [
          {
            id: '1',
            ticket: '#A101',
            name: 'Sarah Jenkins',
            joined: '09:15 AM',
            waited: '04:12',
            status: 'served',
            servedAt: '09:19 AM',
          },
          {
            id: '2',
            ticket: '#A102',
            name: 'Michael Chen',
            joined: '09:18 AM',
            waited: '08:00',
            status: 'skipped',
            servedAt: null,
          },
          {
            id: '3',
            ticket: '#A103',
            name: 'Eleanor Rigby',
            joined: '09:22 AM',
            waited: '10:00',
            status: 'skipped',
            servedAt: null,
          },
          {
            id: '4',
            ticket: '#A109',
            name: 'Angela Martin',
            joined: '09:50 AM',
            waited: '04:45',
            status: 'served',
            servedAt: '09:55 AM',
          },
          {
            id: '5',
            ticket: '#A109',
            name: 'Angela Martin',
            joined: '09:50 AM',
            waited: '04:45',
            status: 'served',
            servedAt: '09:55 AM',
          },
        ],
        totalCount: 47,
        timeline: [
          {
            time: '09:14 AM',
            label: 'Queue Opened',
            sub: null,
            type: 'success',
          },
          {
            time: '09:19 AM',
            label: 'First person served',
            sub: null,
            type: 'success',
          },
          {
            time: '10:45 AM',
            label: 'Peak reached (23 people)',
            sub: null,
            type: 'warning',
          },
          {
            time: '11:12 AM',
            label: 'Manual skip triggered (A115)',
            sub: null,
            type: 'warning',
          },
          {
            time: '12:38 PM',
            label: 'Queue closed manually',
            sub: null,
            type: 'danger',
          },
        ],
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load queue history'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function exportCsv(_id: string): Promise<boolean> {
    // STUB — replace with real download endpoint
    await new Promise((r) => setTimeout(r, 400))
    return true
  }

  async function exportPdf(_id: string): Promise<boolean> {
    // STUB — replace with real PDF generation endpoint
    await new Promise((r) => setTimeout(r, 400))
    return true
  }

  return { isLoading, error, fetchHistoryDetail, exportCsv, exportPdf }
}
