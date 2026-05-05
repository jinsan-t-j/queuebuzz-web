import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import type { ApiSuccessResponse } from '@/types/app'

export interface Subscription {
  planName: string
  tier: string
  status: string
  billingCycle: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  cardLast4: string
  updatedAt: string
}

/**
 * @action fetchSubscription
 * @description Fetches the host's current subscription details.
 */
export async function fetchSubscription(): Promise<Subscription | null> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  try {
    const response = (await apiClient.get<ApiSuccessResponse<Subscription>>(
      API_ROUTES.BILLING.SUBSCRIPTION,
      config,
    )) as unknown as ApiSuccessResponse<Subscription>
    return response.data
  } catch {
    return null
  }
}

/**
 * @action cancelSubscription
 * @description Cancels the host's subscription at end of billing period.
 */
export async function cancelSubscription(comment: string, feedback: string): Promise<void> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  await apiClient.post(API_ROUTES.BILLING.CANCEL_SUBSCRIPTION, { comment, feedback }, config)
}

/**
 * @action getPaymentMethodUpdateLink
 * @description Returns a Dodo-hosted link for updating payment method.
 */
export async function getPaymentMethodUpdateLink(returnUrl?: string): Promise<string> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  const response = (await apiClient.post<ApiSuccessResponse<{ paymentLink: string }>>(
    API_ROUTES.BILLING.UPDATE_PAYMENT_METHOD,
    { return_url: returnUrl || '' },
    config,
  )) as unknown as ApiSuccessResponse<{ paymentLink: string }>
  return response.data.paymentLink
}
