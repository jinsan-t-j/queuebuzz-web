/**
 * @composable useBilling
 * @description Composable for billing operations — plan fetching, transformation,
 * comparison data, checkout flow, and auth-gated redirects.
 */
import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import * as billingActions from '../actions/billing.action'
import type { BillingPlan } from '../actions/billing.action'

export interface PlanLimits {
  maxQueuesPerMonth: number
  maxGuestsPerQueue: number
  historyAccess: boolean
  customBranding: boolean
  canExport: boolean
  queueExpiryHours: number
  canViewGuestData: boolean
  historyRetentionDays: number
}

export interface DisplayPlan {
  id: string
  slug: string
  tier: string
  name: string
  price: number
  monthlyPrice: number
  yearlyPrice: number
  discountPercent: number
  currencySymbol: string
  description: string
  isFree: boolean
  limits: PlanLimits
}

export interface ComparisonItem {
  name: string
  key: string
  type: string
  value?: boolean
  custom?: (p: DisplayPlan) => boolean
}

export interface ComparisonCategory {
  category: string
  items: ComparisonItem[]
}

// Flexible property getter for snake_case / camelCase tolerance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(obj: any, ...keys: string[]) {
  for (const key of keys) {
    if (obj[key] !== undefined) return obj[key]
  }
  return undefined
}

function transformPlan(p: BillingPlan, cycle: 'monthly' | 'yearly'): DisplayPlan {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = p
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const limits: any = p.limits || {}

  const mPrice = Number(get(raw, 'monthly_price', 'monthlyPrice') || 0)
  const yPrice = Number(get(raw, 'yearly_price', 'yearlyPrice') || 0)

  const totalMonthlyCost = mPrice * 12
  const discountPercent =
    totalMonthlyCost > 0 ? Math.round(((totalMonthlyCost - yPrice) / totalMonthlyCost) * 100) : 0

  return {
    id: String(raw.id || raw._id || ''),
    slug: String(raw.slug || ''),
    tier: String(raw.tier || ''),
    name: String(raw.name || ''),
    description: String(raw.description || ''),
    price: cycle === 'monthly' ? mPrice : yPrice,
    monthlyPrice: mPrice,
    yearlyPrice: yPrice,
    discountPercent,
    currencySymbol: raw.currency === 'INR' ? '₹' : '$',
    isFree: Boolean(get(raw, 'is_free', 'isFree')),
    limits: {
      maxQueuesPerMonth: Number(get(limits, 'max_queues_per_month', 'maxQueuesPerMonth') || 0),
      maxGuestsPerQueue: Number(get(limits, 'max_guests_per_queue', 'maxGuestsPerQueue') || 0),
      historyAccess: Boolean(get(limits, 'history_access', 'historyAccess')),
      customBranding: Boolean(get(limits, 'custom_branding', 'customBranding')),
      canExport: Boolean(get(limits, 'can_export', 'canExport')),
      queueExpiryHours: Number(get(limits, 'queue_expiry_hours', 'queueExpiryHours') || 0),
      canViewGuestData: Boolean(get(limits, 'can_view_guest_data', 'canViewGuestData')),
      historyRetentionDays: Number(
        get(limits, 'history_retention_days', 'historyRetentionDays') || 0,
      ),
    },
  }
}

export const comparisonFeatures: ComparisonCategory[] = [
  {
    category: 'Queue Management',
    items: [
      { name: 'Queues per Month', key: 'maxQueuesPerMonth', type: 'number' },
      { name: 'Guests per Queue', key: 'maxGuestsPerQueue', type: 'number' },
      { name: 'Queue Expiry time', key: 'queueExpiryHours', type: 'hours' },
      { name: 'Real-time Live Updates', key: 'live', type: 'boolean', value: true },
    ],
  },
  {
    category: 'Insights & History',
    items: [
      { name: 'Access to Past Data', key: 'historyAccess', type: 'boolean' },
      { name: 'Data Storage Duration', key: 'historyRetentionDays', type: 'days' },
      { name: 'Downloadable Reports', key: 'canExport', type: 'boolean' },
      { name: 'Extended Customer Info', key: 'canViewGuestData', type: 'boolean' },
    ],
  },
  {
    category: 'Branding & Support',
    items: [
      { name: 'Custom Branding', key: 'customBranding', type: 'boolean' },
      {
        name: 'Fast Response Support',
        key: 'support',
        type: 'boolean',
        custom: (p: DisplayPlan) => p.tier !== 'free',
      },
      {
        name: 'Personalized Web Link',
        key: 'subdomain',
        type: 'boolean',
        custom: (p: DisplayPlan) => p.tier === 'enterprise',
      },
    ],
  },
]

export function formatComparisonValue(item: ComparisonItem, plan: DisplayPlan): string | number {
  if (item.custom) return item.custom(plan) ? 'Yes' : 'No'
  if (item.value !== undefined) return item.value ? 'Yes' : 'No'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const val = (plan.limits as any)[item.key]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatters: Record<string, (v: any) => string | number> = {
    boolean: (v) => (v ? 'Yes' : 'No'),
    hours: (v) => (v <= 0 ? 'Unlimited' : `${v}h`),
    days: (v) => (v <= 0 ? 'Unlimited' : `${v} days`),
    number: (v) => (v <= 0 ? 'Unlimited' : v),
  }

  const formatter = formatters[item.type]
  return formatter ? formatter(val) : val
}

export function useBilling() {
  const router = useRouter()
  const authStore = useAuthStore()

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const fetchedPlans = ref<BillingPlan[]>([])
  const billingCycle = ref<'monthly' | 'yearly'>('monthly')
  const checkoutLoadingPlan = ref<string | null>(null)
  const checkoutError = ref<string | null>(null)

  async function fetchPlans(country?: string) {
    isLoading.value = true
    error.value = null
    try {
      const plans = await billingActions.fetchPlans(country)
      fetchedPlans.value = plans || []
      return plans
    } catch (e) {
      error.value = (e as Error).message
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function getCheckoutUrl(planId: string, cycle: 'monthly' | 'yearly') {
    isLoading.value = true
    error.value = null
    try {
      return await billingActions.getCheckoutUrl(planId, cycle)
    } catch (e) {
      error.value = (e as Error).message
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCurrentPlan() {
    isLoading.value = true
    error.value = null
    try {
      return await billingActions.fetchCurrentPlan()
    } catch (e) {
      error.value = (e as Error).message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Transformed plans (reactive to billingCycle)
  const allPlans = computed<DisplayPlan[]>(() =>
    fetchedPlans.value.map((p) => transformPlan(p, billingCycle.value)),
  )

  // Grid plans: Free, Pro, Business Elite — excludes Enterprise
  const gridPlans = computed(() => {
    const tiersOrder = ['free', 'pro', 'business_elite', 'elite']
    return allPlans.value
      .filter((p) => p.tier !== 'enterprise' && !p.slug.includes('enterprise'))
      .sort((a, b) => tiersOrder.indexOf(a.tier) - tiersOrder.indexOf(b.tier))
  })

  // Best yearly discount across all plans
  const maxDiscount = computed(() => {
    const discounts = allPlans.value.map((p) => p.discountPercent).filter((d) => d > 0)
    return discounts.length > 0 ? Math.max(...discounts) : 0
  })

  /**
   * Handle plan selection:
   * - Free → redirect to signup/dashboard
   * - Enterprise → mailto sales
   * - Paid → check auth → create checkout session → redirect to Dodo
   */
  async function handleChoosePlan(plan: DisplayPlan) {
    checkoutError.value = null

    if (plan.isFree) {
      if (authStore.isAuthenticated) {
        router.push({ name: 'dashboard' })
      } else {
        router.push({ name: 'login' })
      }
      return
    }

    if (plan.tier === 'enterprise') {
      globalThis.location.href = 'mailto:sales@queuebuzz.com?subject=Enterprise%20Plan%20Inquiry'
      return
    }

    if (!authStore.isAuthenticated) {
      const returnPath = `/pricing?plan=${plan.slug}&cycle=${billingCycle.value}`
      router.push({ name: 'login', query: { redirect: returnPath } })
      return
    }

    checkoutLoadingPlan.value = plan.id
    try {
      const url = await getCheckoutUrl(plan.id, billingCycle.value)
      if (url) {
        globalThis.location.href = url
      } else {
        checkoutError.value = 'Unable to create checkout session. Please try again.'
      }
    } catch {
      checkoutError.value = 'Something went wrong. Please try again.'
    } finally {
      checkoutLoadingPlan.value = null
    }
  }

  function isEliteTier(plan: DisplayPlan): boolean {
    return (
      plan.tier === 'business_elite' ||
      plan.tier === 'elite' ||
      plan.slug.toLowerCase().includes('elite')
    )
  }

  return {
    isLoading,
    error,
    fetchedPlans: fetchedPlans as Ref<BillingPlan[]>,
    billingCycle,
    checkoutLoadingPlan,
    checkoutError,
    allPlans,
    gridPlans,
    maxDiscount,
    fetchPlans,
    getCheckoutUrl,
    fetchCurrentPlan,
    handleChoosePlan,
    isEliteTier,
  }
}
