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
import { test as base } from '@playwright/test'

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
      const pattern = new RegExp(String.raw`.*\/api.*` + route.replaceAll('/', String.raw`\/`))

      await page.route(pattern, async (routeObj) => {
        const origin = routeObj.request().headers().origin || '*'

        if (routeObj.request().method() === 'OPTIONS') {
          return routeObj.fulfill({
            status: 204,
            headers: corsHeaders(origin),
          })
        }

        const body =
          data && (data as Record<string, unknown>).data ? data : { data, success: status < 400 }

        await routeObj.fulfill({
          status,
          contentType: 'application/json',
          headers: corsHeaders(origin),
          body: JSON.stringify(body),
        })
      })
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

      // Catch queue endpoints to prevent CORS leaks
      if (url.includes('/queue/active') || url.includes('/queue/live')) {
        return fulfillJson(route, null, origin)
      }

      // Customer entry (exact path only, not sub-routes like /recover-session)
      if (
        new RegExp(/\/customer\/entry$/).exec(url) ||
        new RegExp(/\/customer\/entry\?/).exec(url)
      ) {
        return fulfillJson(route, null, origin)
      }

      // Auth logout
      if (url.includes('/auth/logout')) {
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

async function fulfillJson(
  route: Parameters<Parameters<(typeof import('@playwright/test').Page)['route']>[1]>[0],
  data: unknown,
  origin: string,
  status = 200,
) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: corsHeaders(origin),
    body: JSON.stringify({ data, success: status < 400 }),
  })
}

export { expect } from '@playwright/test'
