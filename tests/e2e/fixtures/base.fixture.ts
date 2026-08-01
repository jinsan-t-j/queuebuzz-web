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

const customMocks = new Map<string, { data: unknown; status: number }>()

export const test = base.extend<{
  mockApi: MockApiFn
}>({
  mockApi: async ({ context }, use) => {
    const mockFunc: MockApiFn = async (routePath, data, status = 200) => {
      customMocks.set(routePath, { data, status })
      const pattern = `**/*${routePath}*`
      await context.route(pattern, async (routeObj) => {
        const origin = routeObj.request().headers().origin || '*'
        await fulfillJson(routeObj, data, origin, status)
      })
    }
    await use(mockFunc)
    customMocks.clear()
  },

  page: async ({ context, page }, use) => {
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
      const authState = {
        user: {
          id: 'host-1',
          publicId: 'host-pub-1',
          name: 'Dr. Rajan',
          email: 'rajan@example.com',
          tier: 'free',
          avatar: null,
        },
        anonymousQueueId: null,
      }
      globalThis.localStorage.setItem('auth', JSON.stringify(authState))
      globalThis.localStorage.setItem('auth_token', 'mock-token-123')
      globalThis.localStorage.setItem('user_role', 'host')
      globalThis.localStorage.setItem('has_seen_onboarding', 'true')
    })

    // Global API interceptor for bootstrap endpoints on context level
    await context.route('**/api/v1/**', async (route) => {
      try {
        const url = route.request().url()
        const origin = route.request().headers().origin || '*'

        // Preflight
        if (route.request().method() === 'OPTIONS') {
          return route.fulfill({
            status: 204,
            headers: corsHeaders(origin),
          })
        }

        // Check test-specific mocks registered via mockApi Map first
        for (const [routePath, mock] of customMocks.entries()) {
          if (url.includes(routePath)) {
            return await fulfillJson(route, mock.data, origin, mock.status)
          }
        }

        // SSE streams — fulfill immediately to prevent hanging
        if (url.includes('/events')) {
          return await route.fulfill({
            status: 200,
            contentType: 'text/event-stream',
            body: '',
          })
        }

        // Bootstrap: host profile
        if (url.includes('/host/me')) {
          return await fulfillJson(route, makeHostProfile(), origin)
        }

        // Bootstrap: billing plan
        if (url.includes('/billing/current-plan')) {
          return await fulfillJson(route, makeBillingPlan(), origin)
        }

        // Bootstrap: billing plans (pricing page)
        if (url.includes('/billing/plans')) {
          return await fulfillJson(route, makeBillingPlans(), origin)
        }

        // Bootstrap: billing subscription
        if (url.includes('/billing/subscription')) {
          return await fulfillJson(
            route,
            { status: 'active', canViewHistory: true, canExportData: true },
            origin,
          )
        }

        // Bootstrap: queue dashboard
        if (url.includes('/queue/dashboard')) {
          return await fulfillJson(route, makeDashboardResponse(), origin)
        }

        // Catch queue endpoints (legacy only, use exact anchors where possible)
        if (url.endsWith('/queue/active') || url.endsWith('/queue/live')) {
          return await fulfillJson(route, null, origin)
        }

        // Customer entry (exact path only)
        if (url.endsWith('/customer/entry')) {
          return await fulfillJson(route, null, origin)
        }

        // Auth logout
        if (url.includes('/auth/logout')) {
          return await fulfillJson(route, { message: 'OK' }, origin)
        }

        // Auth refresh
        if (url.includes('/auth/refresh/token')) {
          return await fulfillJson(route, { message: 'OK' }, origin)
        }

        // Safe fallback for unhandled test API requests to avoid WebKit connection refused
        return await fulfillJson(route, null, origin)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('[Route Interceptor Error]:', err)
      }
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
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
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
