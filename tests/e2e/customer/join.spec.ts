import { test, expect } from '../fixtures/base.fixture'
import { makePublicQueue } from '../fixtures/mocks/customer.mock'

/**
 * @spec Customer Join Flow
 * @description E2E tests for joining a queue via direct URL and join-by-code page.
 * Routes: /q/:queueId/join, /join
 */

test.describe('Customer Join', () => {
  test('should render join page with queue info', async ({ page, mockApi }) => {
    await mockApi('/queue/p/q-123', makePublicQueue())
    await mockApi('/customer/entry/recover-session', { status: 404, data: null })

    await page.goto('/q/q-123/join')

    // Queue name should be visible
    await expect(page.locator('text=Morning Consultation')).toBeVisible({ timeout: 8000 })
  })

  test('should show loading skeleton initially', async ({ page }) => {
    // Slow down the response
    await page.route('**/api/v1/queue/p/q-123**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(makePublicQueue()),
      })
    })

    await page.goto('/q/q-123/join')

    // Loading skeleton
    await expect(page.locator('text=Connecting to queue...')).toBeVisible()
  })

  test('should show not-found state for invalid queue', async ({ page }) => {
    await page.route('**/api/v1/queue/p/invalid-id**', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*' } })
      }
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Queue not found' }),
      })
    })

    await page.goto('/q/invalid-id/join')

    await expect(page.locator('text=Queue not found')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /Go to homepage/i })).toBeVisible()
  })
})
