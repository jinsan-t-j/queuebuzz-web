/**
 * @module base.fixture
 * @description Shared Playwright test fixture for QueueBuzz E2E tests.
 *
 * Provides:
 * - `mockApi` helper for consistent API mocking with CORS headers
 * - Global API interceptor for bootstrap endpoints (/host/me, /billing, /queue/active, SSE)
 * - Console error logging for debugging
 * - Clean localStorage/sessionStorage between tests
 */
import { test as base, type Route } from '@playwright/test'

import {
  makeHostProfile,
  makeBillingPlan,
  makeDashboardResponse,
  makeBillingPlans,
} from './mocks/host.mock'

type MockApiFn = (route: string, data: unknown, status?: number) => Promise<void>

export const test = base.extend<{
  mockApi: MockApiFn
}>({
  mockApi: async ({ page }, use) => {
    const mockFunc: MockApiFn = async (route, data, status = 200) => {
      await page.route(
        (url) => url.pathname.includes(route) || url.href.includes(route),
        async (routeObj) => {
          const origin = routeObj.request().headers().origin || '*'

          await fulfillJson(routeObj, data, origin, status)
        },
      )
    }
    await use(mockFunc)
  },

  page: async ({ page }, use) => {
    // Log browser console errors for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // eslint-disable-next-line no-console
        console.log(`[Browser error] ${msg.text()}`)
      }
    })

    page.on('pageerror', (err) => {
      // eslint-disable-next-line no-console
      console.log(`[Browser PageError] ${err.name}: ${err.message}\n${err.stack}`)
    })

    page.on('requestfailed', (req) => {
      // eslint-disable-next-line no-console
      console.log(
        `[Request Failed] ${req.method()} ${req.url()} - ${req.failure()?.errorText || 'Unknown error'}`,
      )
    })

    // Log API requests for debugging
    page.on('request', (req) => {
      if (req.url().includes('/api/v1')) {
        // eslint-disable-next-line no-console
        console.log(`[API Request] ${req.method()} ${req.url()}`)
      }
    })
    page.on('response', (res) => {
      if (res.url().includes('/api/v1')) {
        // eslint-disable-next-line no-console
        console.log(`[API Response] ${res.status()} ${res.url()}`)
      }
    })

    // Clean state and set mock auth between tests
    await page.addInitScript(() => {
      globalThis.localStorage.clear()
      globalThis.sessionStorage.clear()

      // Inject mock session
      globalThis.localStorage.setItem('auth_token', 'mock-token-123')
      globalThis.localStorage.setItem('user_role', 'host')
      globalThis.localStorage.setItem('has_seen_onboarding', 'true')
    })

    // Global API interceptor for bootstrap endpoints
    await page.route('**/api/v1/**', async (route) => {
      const url = route.request().url()
      const origin = route.request().headers().origin || '*'

      // Preflight
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({
          status: 204,
          headers: corsHeaders(origin),
        })
      }

      // SSE streams — fulfill immediately to prevent hanging
      if (url.includes('/events')) {
        return route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: '',
        })
      }

      // Bootstrap: host profile
      if (url.includes('/host/me')) {
        return fulfillJson(route, makeHostProfile(), origin)
      }

      // Bootstrap: billing plan
      if (url.includes('/billing/current-plan')) {
        return fulfillJson(route, makeBillingPlan(), origin)
      }

      // Bootstrap: billing plans (pricing page)
      if (url.includes('/billing/plans')) {
        return fulfillJson(route, makeBillingPlans(), origin)
      }

      // Bootstrap: billing subscription
      if (url.includes('/billing/subscription')) {
        return fulfillJson(
          route,
          { status: 'active', canViewHistory: true, canExportData: true },
          origin,
        )
      }

      // Bootstrap: queue dashboard
      if (url.includes('/queue/dashboard')) {
        return fulfillJson(route, makeDashboardResponse(), origin)
      }

      // Catch queue endpoints (legacy only, use exact anchors where possible)
      if (url.endsWith('/queue/active') || url.endsWith('/queue/live')) {
        return fulfillJson(route, null, origin)
      }

      // Customer entry (exact path only)
      if (url.endsWith('/customer/entry')) {
        return fulfillJson(route, null, origin)
      }

      // Auth logout
      if (url.includes('/auth/logout')) {
        return fulfillJson(route, { message: 'OK' }, origin)
      }

      // Auth refresh
      if (url.includes('/auth/refresh/token')) {
        return fulfillJson(route, { message: 'OK' }, origin)
      }

      // Let test-specific mocks take precedence
      await route.continue()
    })

    await use(page)
  },
})

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

async function fulfillJson(route: Route, data: unknown, origin: string, status = 200) {
  // Prevent double-wrapping if the data already follows the { data, success } pattern
  const isAlreadyWrapped = data && typeof data === 'object' && ('data' in data || 'success' in data)
  const responseBody = isAlreadyWrapped
    ? { success: status < 400, ...(data as object) }
    : { data, success: status < 400 }

  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: corsHeaders(origin),
    body: JSON.stringify(responseBody),
  })
}

export { expect, type Page, type Route } from '@playwright/test'
