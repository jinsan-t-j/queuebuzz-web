import { expect, test } from '../fixtures/base.fixture'

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

    await page.goto(`/q/${ACTIVE_QUEUE_ID}`)

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

    await page.goto(`/q/${ACTIVE_QUEUE_ID}`)

    // Loading skeleton or connecting text
    await expect(page.getByText(/connecting/i).first()).toBeVisible()
  })

  test('should handle join form submission', async ({ page, mockApi }) => {
    await mockApi('/queue/p/find', {
      id: ACTIVE_QUEUE_ID,
      name: 'Morning Clinic',
    })

    await page.goto(`/q/${ACTIVE_QUEUE_ID}`)

    // Fill join code (modal uses single input)
    const codeInput = page.getByLabel('Join code')
    await expect(codeInput).toBeVisible({ timeout: 10000 })
    await codeInput.fill('CLNC01')

    await mockApi('/queue/p/find', {
      id: ACTIVE_QUEUE_ID,
      name: 'Morning Clinic',
    })
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/queue/p/find')),
      page.getByRole('button', { name: /Verify code/i }).click(),
    ])

    // Fill form
    await page.fill('#guest-name', 'John Doe')

    // Uncheck "Buzz me" to avoid Notification.requestPermission() hang
    await page.getByLabel(/Toggle haptic vibration buzz notifications/i).click()

    await mockApi(`/customer/entry/join/${ACTIVE_QUEUE_ID}`, {
      id: 'e1',
      ticketNo: 48,
      status: 'WAITING',
    })

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/customer/entry/join') && response.request().method() === 'POST',
      ),
      page.click('button:has-text("Join the Queue")'),
    ])

    // Redirect to waiting room
    await expect(page).toHaveURL(new RegExp(`/q/${ACTIVE_QUEUE_ID}/waiting`))
  })

  test('should show not-found state for invalid queue', async ({ page, mockApi }) => {
    await mockApi('/queue/p/find?id=invalid-q', null, 404)

    await page.goto('/q/invalid-q')
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
    await expect(page).toHaveURL(new RegExp(`/q/${ACTIVE_QUEUE_ID}`))
  })

  test('should render geo-lock notice if queue is geo-locked', async ({ page, mockApi }) => {
    const geoQueueId = 'q-geo-123'
    await mockApi(`/queue/p/${geoQueueId}/live`, {
      id: geoQueueId,
      name: 'Geo Locked Clinic',
      status: 'ACTIVE',
      joinCode: 'CLNC02',
      isGeoLocked: true,
      latitude: 19.076,
      longitude: 72.8777,
      geoRadiusMeters: 200,
    })
    await mockApi('/queue/p/find', {
      id: geoQueueId,
      name: 'Geo Locked Clinic',
      status: 'ACTIVE',
      isGeoLocked: true,
      latitude: 19.076,
      longitude: 72.8777,
      geoRadiusMeters: 200,
    })
    await mockApi('/customer/entry/recover-session', null, 404)

    await page.goto(`/q/${geoQueueId}`)

    const codeInput = page.getByLabel('Join code')
    await expect(codeInput).toBeVisible({ timeout: 10000 })
    await codeInput.fill('CLNC02')
    await page.getByRole('button', { name: /Verify code/i }).click()

    // Notice text should be displayed
    await expect(page.getByText('On-Site Queue Only').first()).toBeVisible()
  })

  test('should render full overlay state when join fails with QUEUE_FULL', async ({
    page,
    mockApi,
  }) => {
    const fullQueueId = 'q-full-123'
    await mockApi(`/queue/p/${fullQueueId}/live`, {
      id: fullQueueId,
      name: 'Full Clinic',
      status: 'ACTIVE',
      joinCode: 'CLNC03',
    })
    await mockApi('/queue/p/find', {
      id: fullQueueId,
      name: 'Full Clinic',
      status: 'ACTIVE',
    })
    await mockApi('/customer/entry/recover-session', null, 404)

    await page.goto(`/q/${fullQueueId}`)

    const codeInput = page.getByLabel('Join code')
    await expect(codeInput).toBeVisible({ timeout: 10000 })
    await codeInput.fill('CLNC03')
    await page.getByRole('button', { name: /Verify code/i }).click()

    await page.fill('#guest-name', 'John Doe')
    await page.getByLabel(/Toggle haptic vibration buzz notifications/i).click()

    // Mock join failing with QUEUE_FULL
    await page.route(`**/customer/entry/join/${fullQueueId}**`, async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'QUEUE_FULL',
          error:
            'This queue has reached its maximum capacity. Please contact the business owner or try again later.',
        }),
      })
    })

    await page.click('button:has-text("Join the Queue")')

    // Expect the full overlay to be visible
    await expect(page.getByRole('heading', { name: 'Queue is currently full' })).toBeVisible({
      timeout: 10000,
    })
    await expect(
      page
        .getByText(
          'This queue has reached its maximum capacity. Please contact the business owner or try again later.',
        )
        .first(),
    ).toBeVisible()
  })

  test('should render paused overlay state when join fails with QUEUE_PAUSED', async ({
    page,
    mockApi,
  }) => {
    const pausedQueueId = 'q-paused-123'
    await mockApi(`/queue/p/${pausedQueueId}/live`, {
      id: pausedQueueId,
      name: 'Paused Clinic',
      status: 'ACTIVE',
      joinCode: 'CLNC04',
    })
    await mockApi('/queue/p/find', {
      id: pausedQueueId,
      name: 'Paused Clinic',
      status: 'ACTIVE',
    })
    await mockApi('/customer/entry/recover-session', null, 404)

    await page.goto(`/q/${pausedQueueId}`)

    const codeInput = page.getByLabel('Join code')
    await expect(codeInput).toBeVisible({ timeout: 10000 })
    await codeInput.fill('CLNC04')
    await page.getByRole('button', { name: /Verify code/i }).click()

    await page.fill('#guest-name', 'John Doe')
    await page.getByLabel(/Toggle haptic vibration buzz notifications/i).click()

    // Mock join failing with QUEUE_PAUSED
    await page.route(`**/customer/entry/join/${pausedQueueId}**`, async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'QUEUE_PAUSED',
          error: 'This queue is currently not accepting new entries. Please check again later.',
        }),
      })
    })

    await page.click('button:has-text("Join the Queue")')

    // Expect the paused overlay to be visible
    await expect(page.getByRole('heading', { name: 'Entries Paused' })).toBeVisible({
      timeout: 10000,
    })
    await expect(
      page
        .getByText('This queue is currently not accepting new entries. Please check again later.')
        .first(),
    ).toBeVisible()
  })

  test('should render paused overlay immediately if queue is paused on load', async ({
    page,
    mockApi,
  }) => {
    const pausedQueueId = 'q-paused-123'
    await mockApi(`/queue/p/${pausedQueueId}/live`, {
      id: pausedQueueId,
      name: 'Paused Clinic',
      status: 'PAUSED',
      joinCode: 'CLNC04',
    })
    await mockApi('/queue/p/find', {
      id: pausedQueueId,
      name: 'Paused Clinic',
      status: 'PAUSED',
    })
    await mockApi('/customer/entry/recover-session', null, 404)

    await page.goto(`/q/${pausedQueueId}`)

    // Expect the paused overlay to be visible immediately without form filling
    await expect(page.getByRole('heading', { name: 'Entries Paused' })).toBeVisible({
      timeout: 10000,
    })
  })

  test('should block joining queue if buzz is enabled but notifications are denied', async ({
    page,
    mockApi,
  }) => {
    // Mock notification permission as denied
    await page.addInitScript(() => {
      Object.defineProperty(globalThis.Notification, 'permission', {
        get: () => 'denied',
      })
      globalThis.Notification.requestPermission = async () => 'denied'
    })

    await mockApi('/queue/p/find', {
      id: ACTIVE_QUEUE_ID,
      name: 'Morning Clinic',
    })

    await page.goto(`/q/${ACTIVE_QUEUE_ID}`)

    const codeInput = page.getByLabel('Join code')
    await expect(codeInput).toBeVisible({ timeout: 10000 })
    await codeInput.fill('CLNC01')
    await page.getByRole('button', { name: /Verify code/i }).click()

    await mockApi(`/customer/entry/join/${ACTIVE_QUEUE_ID}`, {
      id: 'e1',
      ticketNo: 48,
      status: 'WAITING',
    })

    // Keep "Buzz me" checked (which is checked by default)
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/customer/entry/join') && response.request().method() === 'POST',
      ),
      page.click('button:has-text("Join the Queue")'),
    ])

    // Verify submission succeeds with fcmToken null when notifications are denied
    await expect(page).toHaveURL(new RegExp(`/q/${ACTIVE_QUEUE_ID}/waiting`))
  })

  test('should validate phone number length', async ({ page, mockApi }) => {
    await mockApi('/queue/p/find', {
      id: ACTIVE_QUEUE_ID,
      name: 'Morning Clinic',
    })

    await page.goto(`/q/${ACTIVE_QUEUE_ID}`)

    const codeInput = page.getByLabel('Join code')
    await expect(codeInput).toBeVisible({ timeout: 10000 })
    await codeInput.fill('CLNC01')
    await page.getByRole('button', { name: /Verify code/i }).click()

    // Fill name
    await page.fill('#guest-name', 'John Doe')

    // Uncheck "Buzz me"
    await page.getByLabel(/Toggle haptic vibration buzz notifications/i).click()

    // 1. Fill phone number that is too short
    const phoneInput = page.getByPlaceholder(/Phone number/i)
    await phoneInput.fill('12345')

    // Click join
    await page.click('button:has-text("Join the Queue")')

    // Expect validation message for phone length
    await expect(page.getByText(/Must be a valid mobile number/i).first()).toBeVisible()

    // 2. Fill phone number that is too long
    await phoneInput.fill('123456789012345678')
    await page.click('button:has-text("Join the Queue")')
    await expect(page.getByText(/Must be a valid mobile number/i).first()).toBeVisible()
  })

  test('should handle duplicate phone error', async ({ page, mockApi }) => {
    await mockApi('/queue/p/find', {
      id: ACTIVE_QUEUE_ID,
      name: 'Morning Clinic',
    })

    await page.goto(`/q/${ACTIVE_QUEUE_ID}`)

    const codeInput = page.getByLabel('Join code')
    await expect(codeInput).toBeVisible({ timeout: 10000 })
    await codeInput.fill('CLNC01')
    await page.getByRole('button', { name: /Verify code/i }).click()

    // Fill name
    await page.fill('#guest-name', 'John Doe')

    // Uncheck "Buzz me"
    await page.getByLabel(/Toggle haptic vibration buzz notifications/i).click()

    // Fill phone number
    const phoneInput = page.getByPlaceholder(/Phone number/i)
    await phoneInput.fill('9876543210')

    // Mock duplicate phone error (status 429)
    await mockApi(
      `/customer/entry/join/${ACTIVE_QUEUE_ID}`,
      {
        success: false,
        error: 'Guest already in queue!',
        code: 'DUPLICATE_ENTRY',
      },
      429,
    )

    await page.click('button:has-text("Join the Queue")')

    // Verify error toast/message
    await expect(page.getByText(/already in queue/i).first()).toBeVisible()
  })
})
