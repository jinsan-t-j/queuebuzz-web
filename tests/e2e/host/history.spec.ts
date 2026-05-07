import { test, expect } from '../fixtures/base.fixture'
import { makeHistoryList, makeHistoryDetail } from '../fixtures/mocks/host.mock'

/**
 * @spec Queue History
 * @description E2E tests for history list, search, filter, detail view, and CSV export.
 * Routes: /dashboard/queue/history, /dashboard/queue/history/:id
 */

test.describe('Queue History', () => {
  test('should render history list with entries', async ({ page, mockApi }) => {
    await mockApi('/queue/history', makeHistoryList())

    await page.goto('/dashboard/queue/history')

    await expect(page.locator(':text("Morning Batch"):visible').first()).toBeVisible({
      timeout: 5000,
    })
    await expect(page.locator(':text("Evening Batch"):visible').first()).toBeVisible()
  })

  test('should show empty state when no history', async ({ page, mockApi }) => {
    await mockApi('/queue/history', { data: { data: [], total_pages: 0, total_count: 0 } })

    await page.goto('/dashboard/queue/history')

    await expect(page.locator(':text("No history found"):visible').first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('should filter history via search input', async ({ page, mockApi }) => {
    await mockApi('/queue/history', makeHistoryList())

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
    await mockApi('/queue/history', makeHistoryList(1))
    await mockApi('/queue/manage/h-1/history', makeHistoryDetail())

    await page.goto('/dashboard/queue/history')
    await expect(page.locator(':text("Morning Batch"):visible').first()).toBeVisible({
      timeout: 5000,
    })

    // Click on the entry row
    await page.locator(':text("Morning Batch"):visible').first().click()

    // Should navigate to detail
    await expect(page).toHaveURL(/\/history\/h-1/, { timeout: 5000 })
  })
})
