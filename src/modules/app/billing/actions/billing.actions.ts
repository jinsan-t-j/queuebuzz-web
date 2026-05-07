import { apiClient, createApiRequestConfig } from '@/lib/axios'
import { API_ROUTES } from '@/config/api.constants'
import { ApiSuccessResponse } from '@/types/app'

export interface BillingPlan {
  id: string
  slug: string
  tier: string
  name: string
  description: string
  monthly_price: number
  yearly_price: number
  currency: string
  country_code: string
  is_free: boolean
  limits: Record<string, number | boolean>
}

export interface CheckoutResponse {
  url: string
}

export interface CurrentPlanResponse {
  plan: BillingPlan
}

export interface Subscription {
  planName: string
  tier: string
  status: string
  billingCycle: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  cardLast4: string | null
  canCustomBranding: boolean
  canExportData: boolean
  canViewHistory: boolean
  updatedAt: string
}

/**
 * Fetch available plans for a country.
 * Uses browser-level detection hints (timezone/language) for localized pricing.
 */
export async function fetchPlans(country?: string): Promise<BillingPlan[]> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const language = navigator.language

  const config = createApiRequestConfig({
    params: { country },
    headers: {
      'X-Browser-Timezone': timezone,
      'X-Browser-Language': language,
    },
  })

  const response = (await apiClient.get<ApiSuccessResponse<{ plans: BillingPlan[] }>>(
    API_ROUTES.BILLING.PLANS,
    config,
  )) as unknown as ApiSuccessResponse<{ plans: BillingPlan[] }>

  return response.data.plans || []
}

/**
 * Get checkout URL for a specific plan.
 * Creates a hosted checkout session on the backend and returns the Dodo checkout URL.
 */
export async function getCheckoutUrl(
  planId: string,
  billingCycle: 'monthly' | 'yearly',
): Promise<string> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  const response = (await apiClient.post<ApiSuccessResponse<CheckoutResponse>>(
    API_ROUTES.BILLING.CHECKOUT,
    { planId, billingCycle },
    config,
  )) as unknown as ApiSuccessResponse<CheckoutResponse>

  return response.data.url
}

/**
 * Fetch current plan for the authenticated host.
 */
export async function fetchCurrentPlan(): Promise<BillingPlan> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  const response = (await apiClient.get<ApiSuccessResponse<CurrentPlanResponse>>(
    API_ROUTES.BILLING.CURRENT_PLAN,
    config,
  )) as unknown as ApiSuccessResponse<CurrentPlanResponse>

  return response.data.plan
}

/**
 * Fetch current subscription details.
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
 * Cancels the host's subscription at end of billing period.
 */
export async function cancelSubscription(comment: string, feedback: string): Promise<void> {
  const config = createApiRequestConfig({}, { withCredentials: true })
  await apiClient.post(API_ROUTES.BILLING.CANCEL_SUBSCRIPTION, { comment, feedback }, config)
}

/**
 * Returns a Dodo-hosted link for updating payment method.
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
