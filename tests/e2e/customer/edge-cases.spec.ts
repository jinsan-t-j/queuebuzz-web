import { test, expect } from '../fixtures/base.fixture'

/**
 * @spec Customer Edge Cases
 * @description Tests for error and terminal customer states.
 * Routes: /q/:queueId/not-found, /q/:queueId/ended, /error
 */

test.describe('Customer Edge Cases', () => {
  test('should render not-found page for invalid queue', async ({ page }) => {
    await page.goto('/q/nonexistent/not-found')

    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 })
  })

  test('should render ended page with skipped reason', async ({ page, mockApi }) => {
    await mockApi('/queue/p/q-123', {
      data: { id: 'q-123', name: 'Test Queue', status: 'active' },
    })

    // "skipped" falls to default case: title = "Session ended"
    await page.goto('/q/q-123/ended?reason=skipped')

    await expect(page.getByRole('heading', { name: 'Session ended' })).toBeVisible({
      timeout: 5000,
    })
  })

  test('should render ended page with left reason', async ({ page, mockApi }) => {
    await mockApi('/queue/p/q-123', {
      data: { id: 'q-123', name: 'Test Queue', status: 'active' },
    })

    // "left" case: title = "You've left the queue"
    await page.goto('/q/q-123/ended?reason=left')

    await expect(page.getByRole('heading', { name: "You've left the queue" })).toBeVisible({
      timeout: 5000,
    })
  })

  test('should render ended page with expired reason', async ({ page, mockApi }) => {
    await mockApi('/queue/p/q-123', {
      data: { id: 'q-123', name: 'Test Queue', status: 'active' },
    })

    // "expired" case: title = "Queue has ended"
    await page.goto('/q/q-123/ended?reason=expired')

    await expect(page.getByRole('heading', { name: 'Queue has ended' })).toBeVisible({
      timeout: 5000,
    })
  })
})

test.describe('Error Page', () => {
  test('should render error page with default content', async ({ page }) => {
    await page.goto('/error')

    await expect(page.getByText('Something went wrong').first()).toBeVisible()
    await expect(page.getByText('Error Code').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('should render error page with custom props', async ({ page }) => {
    await page.goto(
      '/error?title=Access%20Denied&error=AUTH_EXPIRED&description=Your%20session%20has%20expired',
    )

    await expect(page.getByText('Access Denied').first()).toBeVisible()
    await expect(page.getByText('AUTH_EXPIRED').first()).toBeVisible()
    await expect(page.getByText('Your session has expired').first()).toBeVisible()
  })
})
