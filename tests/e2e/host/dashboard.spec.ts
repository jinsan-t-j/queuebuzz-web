import { test, expect } from '../fixtures/base.fixture'
import { makeDashboardResponse, makeActiveQueueDashboard } from '../fixtures/mocks/host.mock'

/**
 * @spec Host Dashboard
 * @description E2E tests for dashboard visibility, stats cards, greeting,
 * onboarding hero, and active queue status bar.
 * Route: /dashboard
 */

test.describe('Dashboard', () => {
  test('should show onboarding hero for new accounts', async ({ page, mockApi }) => {
    await mockApi('/queue/dashboard', makeDashboardResponse())

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Onboarding hero should show for accounts with no history
    const startBtn = page.getByRole('button', { name: /Start Your First Session|Start Now/i })
    await expect(startBtn.first()).toBeVisible({ timeout: 8000 })
  })

  test('should show greeting and stats for active accounts', async ({ page, mockApi }) => {
    await mockApi('/queue/dashboard', makeActiveQueueDashboard())

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Greeting — wait for the specific greeting text
    await expect(page.getByText(/Good .*, Dr\. Rajan/).first()).toBeVisible({ timeout: 8000 })

    // Stats row
    await expect(page.getByText('Served Today').first()).toBeVisible()
    await expect(page.getByText('Avg Wait').first()).toBeVisible()
  })

  test('should show active queue status bar', async ({ page, mockApi }) => {
    await mockApi('/queue/dashboard', makeActiveQueueDashboard())

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Queue name
    await expect(page.getByText('Morning Consultation').first()).toBeVisible({ timeout: 8000 })
  })

  test('should show loading state then content', async ({ page, mockApi }) => {
    await mockApi('/queue/dashboard', makeActiveQueueDashboard())

    await page.goto('/dashboard')

    // After load, greeting appears
    await expect(page.getByText(/Good .*, Dr\. Rajan/).first()).toBeVisible({ timeout: 8000 })
  })

  test('should show error state on API failure', async ({ page }) => {
    await page.route('**/api/v1/queue/dashboard', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
          },
        })
      }
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true' },
        body: JSON.stringify({ error: 'Server error', success: false }),
      })
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Error state or retry should render
    const errorIndicator = page.getByRole('button', { name: /Retry|Try Again/i })
    await expect(errorIndicator.first()).toBeVisible({ timeout: 8000 })
  })
})
