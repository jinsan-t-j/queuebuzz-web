import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type { HistoryDetail, HistoryQueryParams, HistoryQueryResult } from '../types'
import type { ApiSuccessResponse } from '@/types/app'

/**
 * @action fetchHistory
 * @description Fetches the list of past queues for the host.
 */
export async function fetchHistory(params: HistoryQueryParams): Promise<HistoryQueryResult> {
  const config = createApiRequestConfig({ params }, { withCredentials: true })
  const response = (await apiClient.get<ApiSuccessResponse<HistoryQueryResult>>(
    API_ROUTES.HISTORY.LIST,
    config,
  )) as unknown as ApiSuccessResponse<HistoryQueryResult>
  return response.data
}

/**
 * @action fetchHistoryDetail
 * @description Fetches detail for a single past queue.
 */
export async function fetchHistoryDetail(id: string): Promise<HistoryDetail> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  const response = (await apiClient.get<ApiSuccessResponse<HistoryDetail>>(
    API_ROUTES.HISTORY.DETAIL(id),
    config,
  )) as unknown as ApiSuccessResponse<HistoryDetail>
  return response.data
}

/**
 * @action deleteHistory
 * @description Deletes a single past queue.
 */
export async function deleteHistory(id: string): Promise<boolean> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  await apiClient.delete(API_ROUTES.HISTORY.DELETE(id), config)
  return true
}

/**
 * @action deleteHistoryBulk
 * @description Deletes multiple past queues.
 */
export async function deleteHistoryBulk(ids: string[]): Promise<boolean> {
  const config = createApiRequestConfig({ data: { ids } }, { withCredentials: true })
  await apiClient.delete(API_ROUTES.HISTORY.DELETE_BULK, config)
  return true
}
