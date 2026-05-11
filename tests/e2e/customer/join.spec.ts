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
    await mockApi('/customer/entry/recover-session', null, 404)
  })

  test('should render join page with queue info', async ({ page, mockApi }) => {
    await mockApi('/queue/p/find', {
      id: ACTIVE_QUEUE_ID,
      name: 'Morning Clinic',
    })

    await page.goto(`/q/${ACTIVE_QUEUE_ID}/join`)

    // Wait for the join code prompt to appear
    const codeInput = page.getByLabel('Join code')
    await expect(codeInput).toBeVisible({ timeout: 15000 })

    // Fill join code
    await codeInput.fill('CLNC01')

    await page.getByRole('button', { name: /Verify code/i }).click()

    // Queue name should be visible after verification
    await expect(page.getByText('Morning Clinic').first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('should show loading skeleton initially', async ({ page }) => {
    // Slow down the response to see the skeleton
    await page.route('**/api/v1/queue/p/find**', async (route) => {
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
    await mockApi('/queue/p/find', {
      id: ACTIVE_QUEUE_ID,
      name: 'Morning Clinic',
    })

    await page.goto(`/q/${ACTIVE_QUEUE_ID}/join`)

    // Fill join code (modal uses single input)
    const codeInput = page.getByLabel('Join code')
    await expect(codeInput).toBeVisible({ timeout: 10000 })
    await codeInput.fill('CLNC01')

    await mockApi('/queue/p/find', {
      id: ACTIVE_QUEUE_ID,
      name: 'Morning Clinic',
    })
    await page.getByRole('button', { name: /Verify code/i }).click()
    await page.waitForResponse((response) => response.url().includes('/queue/p/find'))

    // Fill form
    await page.fill('#guest-name', 'John Doe')
    await mockApi(`/customer/entry/join/${ACTIVE_QUEUE_ID}`, {
      id: 'e1',
      ticketNo: 48,
      status: 'WAITING',
    })
    await page.click('button:has-text("Join the Queue")')
    await page.waitForResponse(
      (response) =>
        response.url().includes('/customer/entry/join') && response.request().method() === 'POST',
    )

    // Redirect to waiting room
    await expect(page).toHaveURL(new RegExp(`/q/${ACTIVE_QUEUE_ID}/waiting`))
  })

  test('should show not-found state for invalid queue', async ({ page, mockApi }) => {
    await mockApi('/queue/p/find?id=invalid-q', null, 404)

    await page.goto('/q/invalid-q/join')
    await expect(page.locator('text=Queue not found')).toBeVisible()
  })

  test('should handle join by code grid (JoinByCodeView)', async ({ page, mockApi }) => {
    await page.goto('/join')
    await page.waitForLoadState('networkidle')

    // Verify code entry (multi-input grid)
    const firstInput = page.locator('input[aria-label="Code character 1"]')
    await expect(firstInput).toBeVisible({ timeout: 10000 })

    // Fill each character
    const code = 'ABC123'
    for (let i = 0; i < 6; i++) {
      await page.locator(`input[aria-label="Code character ${i + 1}"]`).fill(code[i])
    }

    await mockApi('/queue/p/find', {
      id: ACTIVE_QUEUE_ID,
      name: 'Main Clinic',
    })

    // Auto-submits on last character usually, or verify button
    await page.getByRole('button', { name: /Join|Verify/i }).click()

    // Should lead to the queue join screen
    await expect(page).toHaveURL(new RegExp(`/q/${ACTIVE_QUEUE_ID}/join`))
  })
})
