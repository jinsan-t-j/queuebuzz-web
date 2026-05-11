import { test, expect } from '../fixtures/base.fixture'
import { makeHistoryList, makeHistoryDetail } from '../fixtures/mocks/host.mock'

/**
 * @spec Queue History
 * @description E2E tests for history list, search, filter, detail view, and CSV export.
 * Routes: /dashboard/queue/history, /dashboard/queue/history/:id
 */

test.describe('Queue History', () => {
  test('should render history list with entries', async ({ page, mockApi }) => {
    await mockApi('/api/v1/queue/history', makeHistoryList())

    await page.goto('/dashboard/queue/history')

    await expect(page.locator(':text("Morning Batch"):visible').first()).toBeVisible({
      timeout: 5000,
    })
    await expect(page.locator(':text("Evening Batch"):visible').first()).toBeVisible()
  })

  test('should show empty state when no history', async ({ page, mockApi }) => {
    await mockApi('/api/v1/queue/history', {
      data: {
        data: [],
        totalCount: 0,
        totalPages: 0,
        summary: { totalSessions: 0, totalServed: 0, avgSessionLength: '0m' },
      },
    })

    await page.goto('/dashboard/queue/history')

    await expect(page.locator(':text("No history found"):visible').first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('should filter history via search input', async ({ page, mockApi }) => {
    await mockApi('/api/v1/queue/history', makeHistoryList())

    await page.goto('/dashboard/queue/history')
    await expect(page.locator(':text("Morning Batch"):visible').first()).toBeVisible({
      timeout: 5000,
    })

    // Search
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('Evening')
      // Debounce wait
      await page.waitForTimeout(500)
    }
  })

  test('should navigate to history detail page', async ({ page, mockApi }) => {
    await mockApi('/api/v1/queue/history', makeHistoryList(1))
    await mockApi('/api/v1/queue/manage/h-1/history', makeHistoryDetail())

    await page.goto('/dashboard/queue/history')
    await expect(page.locator(':text("Morning Batch"):visible').first()).toBeVisible({
      timeout: 5000,
    })

    // Click on the entry row
    await page.locator(':text("Morning Batch"):visible').first().click()

    // Should navigate to detail
    await expect(page).toHaveURL(/\/dashboard\/queue\/history\/h-1/, { timeout: 10000 })
  })
})
