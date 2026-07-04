import { expect, test } from '../fixtures/base.fixture'
import { makeDashboardResponse } from '../fixtures/mocks/host.mock'

test.describe('Queue Conflict Resolution', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    // Mock standard dashboard response with no active queue
    await mockApi('/queue/dashboard', makeDashboardResponse({ hasHistory: true }))
    await page.goto('/dashboard/queue')
  })

  test('should show conflict modal and handle "Cancel"', async ({ page, mockApi }) => {
    // Intercept queue creation with active queue exists error
    await mockApi(
      '/queue/p/create',
      {
        success: false,
        error: 'Active queue exists',
        code: 'ACTIVE_QUEUE_EXISTS',
        queue_id: 'active-queue-123',
      },
      400,
    )

    // Fill form
    await page.getByLabel('Queue Name').fill('New Conflict Queue')

    // Click create queue button
    await page.getByRole('button', { name: /create queue/i }).click()

    // Conflict modal should be visible
    const modalHeading = page.getByRole('heading', { name: 'Active Queue Running' })
    await expect(modalHeading).toBeVisible()

    // Click "Cancel" in conflict modal
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()

    // Modal should be dismissed
    await expect(modalHeading).not.toBeVisible()
  })

  test('should show conflict modal and handle "Resume Current Queue"', async ({
    page,
    mockApi,
  }) => {
    // Intercept queue creation with active queue exists error
    await mockApi(
      '/queue/p/create',
      {
        success: false,
        error: 'Active queue exists',
        code: 'ACTIVE_QUEUE_EXISTS',
        queue_id: 'active-queue-123',
      },
      400,
    )

    // Fill form
    await page.getByLabel('Queue Name').fill('New Conflict Queue')

    // Click create queue
    await page.getByRole('button', { name: /create queue/i }).click()

    const modalHeading = page.getByRole('heading', { name: 'Active Queue Running' })
    await expect(modalHeading).toBeVisible()

    // Click "Resume Current Queue"
    await page.getByRole('button', { name: 'Resume Current Queue' }).click()

    // Modal should close and navigate to dashboard
    await expect(modalHeading).not.toBeVisible()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should show conflict modal and handle "Terminate & Start New"', async ({
    page,
    mockApi,
  }) => {
    // Intercept queue creation with active queue exists error
    await mockApi(
      '/queue/p/create',
      {
        success: false,
        error: 'Active queue exists',
        code: 'ACTIVE_QUEUE_EXISTS',
        queue_id: 'active-queue-123',
      },
      400,
    )

    // Mock terminate queue request success
    await mockApi('/queue/manage/active-queue-123/terminate', { success: true })

    // Fill form
    await page.getByLabel('Queue Name').fill('New Conflict Queue')

    // Click create queue
    await page.getByRole('button', { name: /create queue/i }).click()

    const modalHeading = page.getByRole('heading', { name: 'Active Queue Running' })
    await expect(modalHeading).toBeVisible()

    // Re-mock queue creation to be successful upon termination
    const createdQueue = {
      id: 'new-queue-456',
      name: 'New Conflict Queue',
      joinCode: 'XYZ-789',
      status: 'ACTIVE',
    }
    await mockApi('/queue/p/create', createdQueue)

    // When the form transitions, it checks getLiveQueue or active status, let's mock it
    await mockApi('/queue/live', createdQueue)

    // Click "Terminate & Start New"
    await page.getByRole('button', { name: 'Terminate & Start New' }).click()

    // Conflict modal should be dismissed
    await expect(modalHeading).not.toBeVisible()

    // Wait for Success Modal "Queue is open!"
    await expect(page.getByText('Queue is open!')).toBeVisible()
    await page.getByRole('button', { name: 'OPEN QUEUE' }).click()

    // Should stay on dashboard queue
    await expect(page).toHaveURL(/\/dashboard\/queue/)
  })
})
