/**
 * @composable useDashboardApi
 * @description API stub for dashboard data operations.
 * Phase 2: replace each stub function body with real fetch/axios call.
 */
import { ref } from 'vue'

export function useDashboardApi() {
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchDashboard() {
    isLoading.value = true
    error.value = null
    try {
      // STUB — replace with: return await $fetch('/api/dashboard')
      await new Promise((r) => setTimeout(r, 800))
      return {
        activeQueue: {
          isActive: true,
          queueName: 'Morning Consultation',
          startedAt: '9:14 AM',
        },
        stats: {
          servedToday: 34,
          avgWait: '6m 14s',
          peakWait: 23,
          skipped: 4,
        },
        weekChart: [
          { day: 'MON', value: 28, isFuture: false, isToday: false },
          { day: 'TUE', value: 34, isFuture: false, isToday: false },
          { day: 'WED', value: 42, isFuture: false, isToday: false },
          { day: 'THU', value: 48, isFuture: false, isToday: true },
          { day: 'FRI', value: 38, isFuture: false, isToday: false },
          { day: 'SAT', value: 0, isFuture: true, isToday: false },
          { day: 'SUN', value: 0, isFuture: true, isToday: false },
        ],
        recentSessions: [
          {
            id: '1',
            name: 'Friday Afternoon',
            date: '22 Oct',
            duration: '4h 12m',
            served: 124,
          },
          {
            id: '2',
            name: 'Thursday Rush',
            date: '21 Oct',
            duration: '5h 45m',
            served: 89,
          },
          {
            id: '3',
            name: 'Morning Shift',
            date: '21 Oct',
            duration: '2h 30m',
            served: 42,
          },
        ],
        returnRate: {
          hasData: true,
          chartData: [
            { day: 'MON', rate: 62 },
            { day: 'TUE', rate: 68 },
            { day: 'WED', rate: 65 },
            { day: 'THU', rate: 71 },
            { day: 'FRI', rate: 74 },
            { day: 'SAT', rate: 69 },
            { day: 'SUN', rate: 72 },
          ],
          byQueue: [
            { label: 'Morning', rate: 85 },
            { label: 'Lunch', rate: 62 },
            { label: 'Evening', rate: 45 },
          ],
        },
        droppedSkipped: [
          { hour: 8, day: 0, value: 3 },
          { hour: 9, day: 0, value: 5 },
          { hour: 10, day: 0, value: 2 },
          { hour: 11, day: 0, value: 4 },
          { hour: 12, day: 0, value: 6 },
          { hour: 13, day: 0, value: 3 },
          { hour: 14, day: 0, value: 1 },
          { hour: 15, day: 0, value: 2 },
          { hour: 16, day: 0, value: 4 },
          { hour: 17, day: 0, value: 5 },
          { hour: 18, day: 0, value: 3 },
          { hour: 19, day: 0, value: 2 },
          { hour: 8, day: 1, value: 2 },
          { hour: 9, day: 1, value: 4 },
          { hour: 10, day: 1, value: 6 },
          { hour: 11, day: 1, value: 7 },
          { hour: 12, day: 1, value: 5 },
          { hour: 13, day: 1, value: 3 },
          { hour: 14, day: 1, value: 2 },
          { hour: 15, day: 1, value: 4 },
          { hour: 16, day: 1, value: 5 },
          { hour: 17, day: 1, value: 6 },
          { hour: 18, day: 1, value: 4 },
          { hour: 19, day: 1, value: 1 },
          { hour: 8, day: 2, value: 1 },
          { hour: 9, day: 2, value: 3 },
          { hour: 10, day: 2, value: 5 },
          { hour: 11, day: 2, value: 8 },
          { hour: 12, day: 2, value: 6 },
          { hour: 13, day: 2, value: 4 },
          { hour: 14, day: 2, value: 2 },
          { hour: 15, day: 2, value: 3 },
          { hour: 16, day: 2, value: 5 },
          { hour: 17, day: 2, value: 7 },
          { hour: 18, day: 2, value: 4 },
          { hour: 19, day: 2, value: 2 },
        ],
        peakHours: [
          { hour: '12 AM', value: 2 },
          { hour: '1 AM', value: 0 },
          { hour: '2 AM', value: 0 },
          { hour: '3 AM', value: 0 },
          { hour: '4 AM', value: 0 },
          { hour: '5 AM', value: 1 },
          { hour: '6 AM', value: 3 },
          { hour: '7 AM', value: 8 },
          { hour: '8 AM', value: 15 },
          { hour: '9 AM', value: 22 },
          { hour: '10 AM', value: 28 },
          { hour: '11 AM', value: 32 },
          { hour: '12 PM', value: 35 },
          { hour: '1 PM', value: 30 },
          { hour: '2 PM', value: 25 },
          { hour: '3 PM', value: 20 },
          { hour: '4 PM', value: 18 },
          { hour: '5 PM', value: 22 },
          { hour: '6 PM', value: 28 },
          { hour: '7 PM', value: 24 },
          { hour: '8 PM', value: 18 },
          { hour: '9 PM', value: 12 },
          { hour: '10 PM', value: 6 },
          { hour: '11 PM', value: 3 },
        ],
        quickSetup: {
          show: false,
          steps: [
            {
              label: 'Create your first queue',
              sub: 'Define your service and wait parameters',
              isDone: true,
            },
            {
              label: 'Connect your first customer',
              sub: 'meet your first guest and start your service',
              isDone: false,
            },
            {
              label: 'Complete your first queue',
              sub: 'Grab your streak by completing your first journey',
              isDone: false,
            },
          ],
        },
        greeting: {
          name: 'John',
        },
      }
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, fetchDashboard }
}
