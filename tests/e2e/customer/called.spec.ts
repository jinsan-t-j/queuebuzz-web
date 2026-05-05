import { test, expect } from '../fixtures/base.fixture'

/**
 * @spec Customer Called View
 * @description E2E tests for the "Your turn has arrived" screen.
 * Route: /q/:queueId/called
 */

test.describe('Customer Called', () => {
  test.beforeEach(async ({ mockApi }) => {
    // Mock queue info
    await mockApi('/queue/p/q-123', {
      data: {
        id: 'q-123',
        name: 'Morning Consultation',
        status: 'active',
      },
    })

    // Mock entry data — GET /customer/entry
    await mockApi('/customer/entry', {
      data: {
        id: 'e-999',
        ticket_no: 48,
        ticketNo: 48,
        status: 'CALLED',
        position: 0,
        queue_id: 'q-123',
        guest_name: 'Test User',
      },
    })

    // Mock events SSE endpoint
    await mockApi('/customer/entry/events', '')
  })

  test('should show called screen with ticket and CTA', async ({ page }) => {
    await page.goto('/q/q-123/called')

    // Should display called-specific content
    await expect(page.getByText('Great news!').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Your turn has arrived').first()).toBeVisible()

    // Ticket label
    await expect(page.getByText('Your Ticket').first()).toBeVisible()
  })

  test('should show QR and leave options', async ({ page }) => {
    await page.goto('/q/q-123/called')
    await expect(page.getByText('Great news!').first()).toBeVisible({ timeout: 10000 })

    // SHOW QR button
    await expect(page.getByText('SHOW QR').first()).toBeVisible()

    // Leave option
    await expect(page.getByText('Leave').first()).toBeVisible()
  })
})
