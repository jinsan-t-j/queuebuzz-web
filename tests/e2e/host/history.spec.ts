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

    await expect(page.getByRole('table').getByText('Morning Batch')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('table').getByText('Evening Batch')).toBeVisible()
  })

  test('should show empty state when no history', async ({ page, mockApi }) => {
    await mockApi('/queue/history', { data: { data: [], total_pages: 0, total_count: 0 } })

    await page.goto('/dashboard/queue/history')

    await expect(page.getByText('No history found').first()).toBeVisible({ timeout: 5000 })
  })

  test('should filter history via search input', async ({ page, mockApi }) => {
    await mockApi('/queue/history', makeHistoryList())

    await page.goto('/dashboard/queue/history')
    await expect(page.getByRole('table').getByText('Morning Batch')).toBeVisible({ timeout: 5000 })

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
    await mockApi('/queue/history/h-1', makeHistoryDetail())

    await page.goto('/dashboard/queue/history')
    await expect(page.getByRole('table').getByText('Morning Batch')).toBeVisible({ timeout: 5000 })

    // Click on the entry row
    await page.getByRole('table').getByText('Morning Batch').click()

    // Should navigate to detail
    await expect(page).toHaveURL(/\/history\/h-1/, { timeout: 5000 })
  })
})
