import { test, expect } from '../fixtures/base.fixture'
import { makePublicQueue, makeEntryStatus } from '../fixtures/mocks/customer.mock'

/**
 * @spec Customer Session Recovery & Redirection
 * @description Verifies that the app correctly handles active customer sessions
 * and redirects or warns them when they attempt to join new queues.
 */

test.describe('Customer Session Recovery & Redirection', () => {
  const ACTIVE_QUEUE_ID = 'q-active-123'
  const OTHER_QUEUE_ID = 'q-other-456'

  test.beforeEach(async ({ mockApi }) => {
    // Mock the active queue data
    await mockApi(
      `/queue/p/${ACTIVE_QUEUE_ID}/live`,
      makePublicQueue({ id: ACTIVE_QUEUE_ID, name: 'Active Clinic' }),
    )
    // Mock the other queue data
    await mockApi(
      `/queue/p/${OTHER_QUEUE_ID}/live`,
      makePublicQueue({ id: OTHER_QUEUE_ID, name: 'Other Stall' }),
    )
  })

  test('should redirect to waiting room if visiting join page of already joined queue', async ({
    page,
    mockApi,
  }) => {
    // 1. Setup: Mock a session recovery that returns an entry for ACTIVE_QUEUE_ID
    await mockApi(
      '/customer/entry/recover-session',
      makeEntryStatus('waiting', { queueId: ACTIVE_QUEUE_ID }),
    )

    // 2. Action: Visit the join page for the SAME queue
    await page.goto(`/q/${ACTIVE_QUEUE_ID}/join`)

    // 3. Assertion: Should be redirected to the waiting room
    await expect(page).toHaveURL(new RegExp(`/q/${ACTIVE_QUEUE_ID}/waiting`))
    await expect(page.getByRole('heading', { name: 'Active Clinic' }).first()).toBeVisible()
    await expect(page.getByText('Position', { exact: true }).first()).toBeVisible()
  })

  test('should show warning banner if visiting join page of a different queue', async ({
    page,
    mockApi,
  }) => {
    // 1. Setup: Mock a session recovery for ACTIVE_QUEUE_ID
    await mockApi(
      '/customer/entry/recover-session',
      makeEntryStatus('waiting', { queueId: ACTIVE_QUEUE_ID }),
    )

    // 2. Action: Visit the join page for a DIFFERENT queue
    await page.goto(`/q/${OTHER_QUEUE_ID}/join`)

    // 3. Assertion: Should NOT redirect, but show the ActiveSessionWarning component
    await expect(page).toHaveURL(new RegExp(`/q/${OTHER_QUEUE_ID}/join`))
    await expect(page.getByText('Already in a queue')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Other Stall' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /view active ticket/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /leave current queue/i })).toBeVisible()
  })

  test('should allow leaving current queue to join the new one', async ({ page, mockApi }) => {
    // 1. Setup: Mock session recovery and leave endpoint
    await mockApi(
      '/customer/entry/recover-session',
      makeEntryStatus('waiting', { queueId: ACTIVE_QUEUE_ID }),
    )
    await mockApi('/customer/entry/leave', { success: true })
    // Also mock the queue fetch that happens after leaving
    await mockApi(`/queues/${OTHER_QUEUE_ID}`, { id: OTHER_QUEUE_ID, name: 'Other Stall' })

    // 2. Action: Visit other queue and click "Leave Current Queue"
    await page.goto(`/q/${OTHER_QUEUE_ID}/join`)

    // Wait for the leave request to finish to ensure store is updated
    const leavePromise = page.waitForResponse('**/api/v1/customer/entry/leave')
    await page.getByRole('button', { name: /leave current queue/i }).click()
    await leavePromise

    // 3. Assertion: Warning should disappear and Code Prompt should be visible
    await expect(page.getByText(/already in a queue/i)).not.toBeVisible()

    // Type code to reach the form
    await page.getByPlaceholder('Enter 6-digit code').fill('CLNC01')
    await page.getByRole('button', { name: 'Verify Code' }).click()

    await expect(page.getByRole('button', { name: /join the queue/i })).toBeVisible()
  })

  test('should show warning in JoinByCodeView if already in a queue', async ({ page, mockApi }) => {
    // 1. Setup: Mock session recovery
    await mockApi(
      '/customer/entry/recover-session',
      makeEntryStatus('waiting', { queueId: ACTIVE_QUEUE_ID }),
    )

    // 2. Action: Visit the general join-by-code page
    await page.goto('/join')

    // 3. Assertion: Should show the warning banner
    // Use a more specific locator and wait for it
    const warning = page.locator('text=Already in a queue').first()
    await expect(warning).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /view active ticket/i })).toBeVisible()
  })

  test('should recover from email token link and redirect to the joined queue', async ({
    page,
    mockApi,
  }) => {
    await mockApi(
      `/queue/p/${ACTIVE_QUEUE_ID}/live`,
      makePublicQueue({ id: ACTIVE_QUEUE_ID, name: 'Recovery Clinic' }),
    )
    await mockApi(
      '/customer/entry/recover-by-token',
      makeEntryStatus('waiting', {
        queueId: ACTIVE_QUEUE_ID,
        id: 'entry-recovery-1',
      }),
    )

    await page.goto(`/q/${ACTIVE_QUEUE_ID}/recover?token=test-token`)

    await expect(page).toHaveURL(new RegExp(`/q/${ACTIVE_QUEUE_ID}/waiting`))
    await expect(page.getByRole('heading', { name: 'Recovery Clinic' }).first()).toBeVisible()
  })

  test('should show a recovery error when the token is missing or invalid', async ({
    page,
    mockApi,
  }) => {
    await mockApi(
      `/queue/p/${ACTIVE_QUEUE_ID}/live`,
      makePublicQueue({ id: ACTIVE_QUEUE_ID, name: 'Recovery Clinic' }),
    )
    await mockApi('/customer/entry/recover-by-token', { message: 'expired' }, 401)

    await page.goto(`/q/${ACTIVE_QUEUE_ID}/recover?token=expired-token`)
    await expect(page.getByText('Session recovery failed')).toBeVisible()
    await expect(
      page.getByText('This recovery link is invalid or has already been used.'),
    ).toBeVisible()

    await page.goto(`/q/${ACTIVE_QUEUE_ID}/recover`)
    await expect(page.getByText('Missing recovery token.')).toBeVisible()
  })
})
