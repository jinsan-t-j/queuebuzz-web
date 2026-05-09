/**
 * @module host.mock
 * @description Centralized API response factories for host/dashboard endpoints.
 * Single source of truth — change shape once, all tests update.
 */

export function makeDashboardResponse<T extends Record<string, unknown>>(overrides: T = {} as T) {
  return {
    data: {
      active_queue: null as unknown,
      stats: { servedToday: 0, avgWait: '0m', peakWait: 0, skipped: 0 },
      hasHistory: false,
      greeting: { name: 'Dr. Rajan' },
      weekChart: [],
      recentSessions: [],
      returnRate: { hasData: false, returningCount: 0, chartData: [], byQueue: [] },
      droppedSkipped: [],
      peakHours: [],
      quickSetup: { show: false, steps: [] },
      ...overrides,
    },
  }
}

export function makeActiveQueueDashboard(overrides: Record<string, unknown> = {}) {
  return makeDashboardResponse({
    active_queue: {
      id: 'q-123',
      queueName: 'Morning Consultation',
      status: 'active',
      waiting: 8,
      avgWaitTime: 12,
      joinCode: 'CLNC01',
      isActive: true,
      startedAt: new Date().toISOString(),
      ...overrides,
    },
    hasHistory: true,
    stats: { servedToday: 42, avgWait: '15m', peakWait: 20, skipped: 2 },
  })
}

export function makeHostProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'host-1',
    public_id: 'pub-host-1',
    name: 'Dr. Rajan',
    email: 'host@queuebuzz.app',
    tier: 'premium',
    avatar: null,
    ...overrides,
  }
}

export function makeBillingPlan(overrides: Record<string, unknown> = {}) {
  return {
    plan: {
      id: 'plan-premium',
      slug: 'premium',
      tier: 'premium',
      name: 'Premium Plan',
      is_free: false,
      limits: { historyAccess: true, smsNotifications: true },
      ...overrides,
    },
  }
}

export function makeSettingsResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      id: 'h-1',
      name: 'Dr. Rajan',
      email: 'rajan@example.com',
      phone: '+91 98765 43210',
      settings: {
        default_queue_name: 'Main Clinic',
        avg_service_mins: 10,
        email_notifications: true,
        push_notifications: false,
        collect_emails: true,
      },
      ...overrides,
    },
  }
}

export function makeHistoryList(count = 2) {
  return {
    data: {
      data: Array.from({ length: count }, (_, i) => ({
        id: `h-${i + 1}`,
        date_formatted: `${24 - i} May 2026`,
        name: i === 0 ? 'Morning Batch' : 'Evening Batch',
        status: i === 0 ? 'Completed' : 'Terminated',
        total_served: i === 0 ? 24 : 5,
        avg_wait: i === 0 ? '12m' : '45m',
      })),
      total_pages: 1,
      total_count: count,
    },
  }
}

export function makeHistoryDetail(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      id: 'h-1',
      name: 'Morning Batch',
      date: '2026-05-24',
      total_served: 24,
      avg_wait: '12m',
      entries: [
        { ticketNo: 'A001', guestName: 'John', status: 'served', waitTime: 10 },
        { ticketNo: 'A002', guestName: 'Jane', status: 'skipped', waitTime: 0 },
      ],
      ...overrides,
    },
  }
}

export function makeLiveQueueEntries() {
  return {
    data: [
      { id: 'e-1', ticket_no: 101, name: 'Aditya R.', status: 'waiting', position: 1 },
      { id: 'e-2', ticket_no: 102, name: 'Bhavna K.', status: 'waiting', position: 2 },
      { id: 'e-3', ticket_no: 103, name: 'Chetan S.', status: 'waiting', position: 3 },
    ],
  }
}

export function makeBillingPlans() {
  return [
    {
      id: 'plan-free',
      slug: 'free',
      tier: 'free',
      name: 'Free',
      description: 'Perfect for solo operators and small experiments.',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      billingCycle: 'monthly',
      isFree: true,
      limits: {
        maxQueuesPerMonth: 1,
        maxGuestsPerQueue: 10,
        queueExpiryHours: 24,
        historyAccess: false,
        historyRetentionDays: 0,
        canExport: false,
        customBranding: false,
      },
    },
    {
      id: 'plan-starter',
      slug: 'starter',
      tier: 'starter',
      name: 'Starter',
      description: 'Everything you need to run a professional queue.',
      price: 49900,
      currency: 'INR',
      currencySymbol: '₹',
      billingCycle: 'monthly',
      isFree: false,
      discountPercent: 0,
      limits: {
        maxQueuesPerMonth: 5,
        maxGuestsPerQueue: 50,
        queueExpiryHours: 48,
        historyAccess: true,
        historyRetentionDays: 7,
        canExport: false,
        customBranding: false,
      },
    },
    {
      id: 'plan-premium',
      slug: 'premium',
      tier: 'premium',
      name: 'Premium',
      description: 'The ultimate tool for busy businesses and clinics.',
      price: 99900,
      currency: 'INR',
      currencySymbol: '₹',
      billingCycle: 'monthly',
      isFree: false,
      discountPercent: 0,
      limits: {
        maxQueuesPerMonth: -1,
        maxGuestsPerQueue: -1,
        queueExpiryHours: -1,
        historyAccess: true,
        historyRetentionDays: -1,
        canExport: true,
        customBranding: true,
      },
    },
  ]
}
