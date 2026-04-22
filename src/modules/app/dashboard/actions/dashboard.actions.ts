import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type { DashboardData } from '@/modules/app/dashboard/types'
import type { ApiSuccessResponse } from '@/types/app'

/**
 * Fetches dashboard aggregation data for the host.
 * @returns {Promise<DashboardData>}
 */
export async function fetchDashboard(): Promise<DashboardData> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  const response = (await apiClient.get<ApiSuccessResponse<DashboardData>>(
    API_ROUTES.QUEUE.DASHBOARD,
    config,
  )) as unknown as ApiSuccessResponse<DashboardData>
  return response.data
}
