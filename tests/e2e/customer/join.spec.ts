import { test, expect } from '../fixtures/base.fixture'

const ACTIVE_QUEUE_ID = 'q-active-123'

test.describe('Customer Join', () => {
  test.beforeEach(async ({ mockApi }) => {
    // Default mocks
    await mockApi(`/queue/p/${ACTIVE_QUEUE_ID}/live`, {
      id: ACTIVE_QUEUE_ID,
      name: 'Morning Clinic',
      status: 'ACTIVE',
      joinCode: 'CLNC01',
    })
    await mockApi('/customer/entry/recover-session', { status: 404, data: null })
  })

  test('should render join page with queue info', async ({ page, mockApi }) => {
    await mockApi(`/customer/entry/join-by-code/CLNC01`, {
      success: true,
      data: { queueId: ACTIVE_QUEUE_ID, joinCode: 'CLNC01' },
    })

    await page.goto(`/q/${ACTIVE_QUEUE_ID}/join`)

    // Wait for the join code prompt to appear
    const firstInput = page.locator('input[aria-label="Code character 1"]')
    await expect(firstInput).toBeVisible({ timeout: 10000 })

    // Fill join code
    await firstInput.focus()
    await page.keyboard.type('CLNC01')

    await page.getByRole('button', { name: 'Verify code' }).click()

    // Queue name should be visible after verification
    await expect(page.getByText('Morning Clinic').first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('should show loading skeleton initially', async ({ page }) => {
    // Slow down the response to see the skeleton
    await page.route('**/api/v1/queue/p/q-active-123**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: ACTIVE_QUEUE_ID,
            name: 'Morning Clinic',
            status: 'ACTIVE',
            joinCode: 'CLNC01',
          },
        }),
      })
    })

    await page.goto(`/q/${ACTIVE_QUEUE_ID}/join`)

    // Loading skeleton or connecting text
    await expect(page.getByText(/connecting/i).first()).toBeVisible()
  })

  test('should handle join form submission', async ({ page, mockApi }) => {
    await mockApi(`/customer/entry/join-by-code/CLNC01`, {
      success: true,
      data: { queueId: ACTIVE_QUEUE_ID, joinCode: 'CLNC01' },
    })
    await mockApi('/customer/entry', {
      success: true,
      data: { id: 'entry-123', ticketNo: 'A-001', status: 'WAITING' },
    })

    await page.goto(`/q/${ACTIVE_QUEUE_ID}/join`)

    // Verify code
    const firstInput = page.locator('input[aria-label="Code character 1"]')
    await expect(firstInput).toBeVisible()
    await firstInput.focus()
    await page.keyboard.type('CLNC01')
    await page.getByRole('button', { name: 'Verify code' }).click()

    // Fill form
    await page.fill('#guest-name', 'John Doe')
    await page.click('button:has-text("Join the Queue")')

    // Redirect to waiting room
    await expect(page).toHaveURL(new RegExp(`/q/${ACTIVE_QUEUE_ID}/waiting`))
  })

  test('should show not-found state for invalid queue', async ({ page, mockApi }) => {
    await mockApi('/queue/p/invalid-q/live', {
      status: 404,
      body: { error: 'not found' },
    })

    await page.goto('/q/invalid-q/join')
    await expect(page.locator('text=Queue not found')).toBeVisible()
  })
})
