import { test, expect } from '../fixtures/base.fixture'
import { makeEntryStatus } from '../fixtures/mocks/customer.mock'

const ACTIVE_QUEUE_ID = 'q-active-123'
const OTHER_QUEUE_ID = 'q-active-456'

test.describe('Customer Session Recovery & Redirection', () => {
  test.beforeEach(async ({ mockApi }) => {
    // Default queue mocks
    await mockApi(`/queue/p/${ACTIVE_QUEUE_ID}/live`, {
      id: ACTIVE_QUEUE_ID,
      name: 'Active Clinic',
      status: 'ACTIVE',
      joinCode: 'CLNC01',
    })
    await mockApi(`/queue/p/${OTHER_QUEUE_ID}/live`, {
      id: OTHER_QUEUE_ID,
      name: 'Other Stall',
      status: 'ACTIVE',
      joinCode: 'STALL2',
    })
    // Mock the join code resolution
    await mockApi(`/customer/entry/join-by-code/CLNC01`, {
      success: true,
      data: { queueId: ACTIVE_QUEUE_ID, joinCode: 'CLNC01' },
    })
    await mockApi(`/customer/entry/join-by-code/STALL2`, {
      success: true,
      data: { queueId: OTHER_QUEUE_ID, joinCode: 'STALL2' },
    })
  })

  test('should redirect to waiting room if visiting join page of already joined queue', async ({
    page,
    mockApi,
  }) => {
    await mockApi(
      '/customer/entry/recover-session',
      makeEntryStatus('waiting', { queueId: ACTIVE_QUEUE_ID }),
    )

    await page.goto(`/q/${ACTIVE_QUEUE_ID}/join`)

    // Should be redirected to the waiting room
    await expect(page).toHaveURL(new RegExp(`/q/${ACTIVE_QUEUE_ID}/waiting`))
    await expect(page.getByText('Active Clinic').first()).toBeVisible()
    await expect(page.getByText('Position', { exact: true }).first()).toBeVisible()
  })

  test('should show warning banner if visiting join page of a different queue', async ({
    page,
    mockApi,
  }) => {
    await mockApi(
      '/customer/entry/recover-session',
      makeEntryStatus('waiting', { queueId: ACTIVE_QUEUE_ID }),
    )

    await page.goto(`/q/${OTHER_QUEUE_ID}/join`)

    // Fill code for the OTHER queue
    const firstInput = page.locator('input[aria-label="Code character 1"]')
    await expect(firstInput).toBeVisible()
    await firstInput.focus()
    await page.keyboard.type('STALL2')

    await page.getByRole('button', { name: 'Verify code' }).click()

    // Assertion: Should NOT redirect, but show the ActiveSessionWarning component
    await expect(page.getByText(/already in a queue/i).first()).toBeVisible()
    await expect(page.getByText('Other Stall').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /view active ticket/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /leave current queue/i })).toBeVisible()
  })

  test('should allow leaving current queue to join the new one', async ({ page, mockApi }) => {
    await mockApi(
      '/customer/entry/recover-session',
      makeEntryStatus('waiting', { queueId: ACTIVE_QUEUE_ID }),
    )
    await mockApi('/customer/entry/leave', { success: true })

    await page.goto(`/q/${OTHER_QUEUE_ID}/join`)

    // Fill code for the OTHER queue
    const firstInput = page.locator('input[aria-label="Code character 1"]')
    await expect(firstInput).toBeVisible()
    await firstInput.focus()
    await page.keyboard.type('STALL2')
    await page.getByRole('button', { name: 'Verify code' }).click()

    // Click "Leave Current Queue"
    await page.getByRole('button', { name: /leave current queue/i }).click()

    // Warning should disappear and join form should be visible
    await expect(page.getByText(/already in a queue/i)).not.toBeVisible()
    await expect(page.getByRole('button', { name: /join the queue/i })).toBeVisible()
  })

  test('should show warning in JoinByCodeView if already in a queue', async ({ page, mockApi }) => {
    await mockApi(
      '/customer/entry/recover-session',
      makeEntryStatus('waiting', { queueId: ACTIVE_QUEUE_ID }),
    )

    await page.goto('/join')

    // Fill code for OTHER queue
    const firstInput = page.locator('input[aria-label="Code character 1"]')
    await expect(firstInput).toBeVisible()
    await firstInput.focus()
    await page.keyboard.type('STALL2')

    // The button on JoinByCodeView is "Proceed to Join"
    await page.getByRole('button', { name: /proceed to join/i }).click()

    // Should be redirected to the join page and show warning
    await expect(page).toHaveURL(new RegExp(`/q/${OTHER_QUEUE_ID}/join`))
    await expect(page.getByText(/already in a queue/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /leave current queue/i })).toBeVisible()
  })
})
