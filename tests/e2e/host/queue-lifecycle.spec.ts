import { test, expect } from '../fixtures/base.fixture'
import { makeDashboardResponse, makeActiveQueueDashboard } from '../fixtures/mocks/host.mock'

/**
 * @spec Queue Lifecycle
 * @description E2E tests for queue views: create, active dashboard, and management page.
 * Routes: /dashboard, /dashboard/queue
 */

test.describe('Queue Lifecycle', () => {
  test('should show create queue view on empty dashboard', async ({ page, mockApi }) => {
    await mockApi('/queue/dashboard', makeDashboardResponse())

    await page.goto('/dashboard/queue')
    await page.waitForLoadState('networkidle')

    // The create/manage queue page should render
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('should show active queue on dashboard', async ({ page, mockApi }) => {
    await mockApi('/queue/dashboard', makeActiveQueueDashboard())

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Queue name should be visible
    await expect(page.getByText('Morning Consultation').first()).toBeVisible({ timeout: 8000 })
  })

  test('should render queue management page with active queue', async ({ page, mockApi }) => {
    const dashboard = makeActiveQueueDashboard()
    await mockApi('/queue/dashboard', dashboard)
    await mockApi('/queue/active', {
      data: {
        id: 'q-123',
        public_id: 'p-q-123',
        queue_name: 'Morning Consultation',
        status: 'active',
        waiting: 3,
        is_active: true,
        joinCode: 'CLNC01',
        startedAt: new Date().toISOString(),
      },
    })
    await mockApi('/queue/manage/q-123/live', { data: [] })

    await page.goto('/dashboard/queue')
    await page.waitForLoadState('networkidle')

    // Should render the queue management page (heading visible)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('should show or hide Week tab in Queue Analysis Card based on queue expiry', async ({
    page,
    mockApi,
  }) => {
    // 1. Less than 24 hours expiry (e.g. 12 hours) -> Hide "Week" button
    const shortExpiryDashboard = makeActiveQueueDashboard({
      active_queue: {
        id: 'q-123',
        queueName: 'Morning Consultation',
        status: 'active',
        waiting: 3,
        isActive: true,
        joinCode: 'CLNC01',
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      },
    })
    await mockApi('/queue/dashboard', shortExpiryDashboard)
    await mockApi('/queue/live', {
      data: {
        id: 'q-123',
        public_id: 'p-q-123',
        queue_name: 'Morning Consultation',
        status: 'active',
        waiting: 3,
        is_active: true,
        joinCode: 'CLNC01',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      },
    })
    await mockApi('/queue/active', {
      data: {
        id: 'q-123',
        public_id: 'p-q-123',
        queue_name: 'Morning Consultation',
        status: 'active',
        waiting: 3,
        is_active: true,
        joinCode: 'CLNC01',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      },
    })
    await mockApi('/queue/manage/q-123/live', { data: [] })

    await page.goto('/dashboard/queue')
    await page.waitForLoadState('networkidle')

    // Expect 'Day' and 'Week' buttons to NOT be visible
    await expect(page.getByRole('button', { name: 'Day' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Week' })).not.toBeVisible()

    // 2. 24 hours or more expiry (e.g. 48 hours) -> Show "Week" button
    const longExpiryDashboard = makeActiveQueueDashboard({
      active_queue: {
        id: 'q-123',
        queueName: 'Morning Consultation',
        status: 'active',
        waiting: 3,
        isActive: true,
        joinCode: 'CLNC01',
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      },
    })
    await mockApi('/queue/dashboard', longExpiryDashboard)
    await mockApi('/queue/live', {
      data: {
        id: 'q-123',
        public_id: 'p-q-123',
        queue_name: 'Morning Consultation',
        status: 'active',
        waiting: 3,
        is_active: true,
        joinCode: 'CLNC01',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      },
    })
    await mockApi('/queue/active', {
      data: {
        id: 'q-123',
        public_id: 'p-q-123',
        queue_name: 'Morning Consultation',
        status: 'active',
        waiting: 3,
        is_active: true,
        joinCode: 'CLNC01',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      },
    })

    await page.goto('/dashboard/queue')
    await page.waitForLoadState('networkidle')

    // Expect 'Day' and 'Week' buttons to both be visible
    await expect(page.getByRole('button', { name: 'Day' })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('button', { name: 'Week' })).toBeVisible()
  })
})
