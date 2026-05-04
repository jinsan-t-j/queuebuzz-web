import { test, expect } from '../fixtures/base.fixture'

/**
 * @spec Customer Served View
 * @description E2E tests for the "You're all done!" screen.
 * Route: /q/:queueId/served
 */

test.describe('Customer Served', () => {
  test('should render served screen with ticket and feedback CTA', async ({ page, mockApi }) => {
    await mockApi('/queue/p/q-123', {
      data: { id: 'q-123', name: 'Morning Consultation', status: 'active' },
    })

    // Navigate with ticket query param (as the app does)
    await page.goto('/q/q-123/served?t=0048')

    // Success message
    await expect(page.getByRole('heading', { name: "You're all done!" })).toBeVisible({
      timeout: 8000,
    })
    await expect(page.getByText('Thanks for using QueueBuzz')).toBeVisible()

    // Ticket number from query
    await expect(page.getByText('0048').first()).toBeVisible()

    // SERVED badge
    await expect(page.getByText('SERVED', { exact: true })).toBeVisible()

    // Feedback CTA
    await expect(page.getByRole('button', { name: /Share Feedback/i })).toBeVisible()

    // Done button
    await expect(page.getByRole('button', { name: /Done.*Exit/i })).toBeVisible()
  })

  test('should navigate home on Done & Exit click', async ({ page, mockApi }) => {
    await mockApi('/queue/p/q-123', {
      data: { id: 'q-123', name: 'Test Queue', status: 'active' },
    })

    await page.goto('/q/q-123/served?t=0048')
    await expect(page.getByRole('heading', { name: "You're all done!" })).toBeVisible({
      timeout: 8000,
    })

    await page.getByRole('button', { name: /Done.*Exit/i }).click()
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })
})
