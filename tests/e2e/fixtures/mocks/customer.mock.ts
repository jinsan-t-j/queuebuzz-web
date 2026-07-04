/**
 * @module customer.mock
 * @description Centralized API response factories for customer-facing endpoints.
 */

export function makePublicQueue(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      id: 'q-123',
      name: 'Morning Consultation',
      status: 'active',
      joinCode: 'CLNC01',
      slug: 'morning-consultation',
      avgServiceMins: 10,
      allowPartyJoining: true,
      maxPartySize: 5,
      hostProfileImageUrl: null,
      hostBannerImageUrl: null,
      ...overrides,
    },
  }
}

export function makeJoinResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      id: 'e-999',
      ticketNo: 48,
      name: 'Karan Johar',
      status: 'waiting',
      position: 15,
      estimatedWaitMins: 45,
      ...overrides,
    },
  }
}

export function makeEntryStatus(
  status: 'waiting' | 'called' | 'arrived' | 'served' | 'idle' | 'skipped' | 'left',
  overrides: Record<string, unknown> = {},
) {
  return {
    data: {
      id: 'e-999',
      ticketNo: 48,
      name: 'Karan Johar',
      status: status.toUpperCase(),
      position: status === 'waiting' ? 15 : 0,
      estimatedWaitMins: status === 'waiting' ? 45 : 0,
      ...overrides,
    },
  }
}
