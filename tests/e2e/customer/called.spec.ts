import { test, expect } from '../fixtures/base.fixture'

/**
 * @spec Customer Called View
 * @description E2E tests for the "Your turn has arrived" screen.
 * Route: /q/:queueId/called
 */

test.describe('Customer Called', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    // Inject customer session tokens before navigation
    await page.addInitScript(() => {
      globalThis.localStorage.setItem('customer_entry_token', 'mock-entry-token')
      globalThis.localStorage.setItem('customer_entry_id', 'e-999')
      globalThis.localStorage.setItem('customer_queue_id', 'q-123')
    })

    // Mock queue info
    await mockApi('/queue/p/q-123', {
      data: {
        id: 'q-123',
        name: 'Morning Consultation',
        status: 'active',
      },
    })

    // Mock queue find info
    await mockApi('/queue/p/find', {
      data: {
        id: 'q-123',
        name: 'Morning Consultation',
        status: 'active',
      },
    })

    // Mock live queue lookup
    await mockApi('/queue/p/q-123/live', {
      data: {
        id: 'q-123',
        name: 'Morning Consultation',
        status: 'active',
        avgServiceMins: 10,
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
        queueId: 'q-123',
        guest_name: 'Test User',
        name: 'Test User',
        token: 'mock-entry-token',
      },
    })

    // Mock events SSE endpoint
    await mockApi('/customer/entry/events', '')

    // Mock session recovery
    await mockApi('/customer/entry/recover-session', {
      data: {
        id: 'e-999',
        ticket_no: 48,
        ticketNo: 48,
        status: 'CALLED',
        position: 0,
        queue_id: 'q-123',
        queueId: 'q-123',
        name: 'Test User',
        token: 'mock-entry-token',
      },
    })
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

  test('should open and close the arrival QR modal', async ({ page }) => {
    await page.goto('/q/q-123/called')
    await expect(page.getByRole('button', { name: 'SHOW QR' })).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: 'SHOW QR' }).click()

    await expect(page.getByRole('heading', { name: 'Your Arrival QR' })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText('Ticket').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save to Gallery' })).toBeVisible()

    await page.getByRole('button', { name: 'Got it' }).click()

    await expect(page.getByRole('heading', { name: 'Your Arrival QR' })).not.toBeVisible()
  })
})
