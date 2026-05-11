import { test, expect } from '../fixtures/base.fixture'
import { makeDashboardResponse } from '../fixtures/mocks/host.mock'

test.describe('Slug Validation', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi('/queue/dashboard', makeDashboardResponse({ hasHistory: true }))
    await page.goto('/dashboard/queue')
  })

  test('should show error when slug is already taken', async ({ page, mockApi }) => {
    // Mock available slug check
    await mockApi('/queue/slug-check?slug=taken-slug', { isAvailable: false })

    // Fill form
    await page.getByLabel('Queue Name').fill('Existing Queue')

    // Fill slug
    const slugInput = page.getByLabel('Queue Link (Optional)')
    await slugInput.fill('taken-slug')

    // Wait for API check
    await page.waitForResponse(
      (response) =>
        response.url().includes('/queue/slug-check') && response.request().method() === 'GET',
    )

    // Check error message
    await expect(page.locator('text=This link is already taken').first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('should show error for invalid slug format', async ({ page }) => {
    // Fill form
    await page.getByLabel('Queue Name').fill('Invalid Slug Test')

    // Fill invalid slug
    const slugInput = page.getByLabel('Queue Link (Optional)')
    await slugInput.fill('invalid slug!')

    // Error should show up immediately (client-side)
    await expect(
      page.locator('text=lowercase alphanumeric characters or hyphens').first(),
    ).toBeVisible()
  })

  test('should allow creating queue with valid custom slug', async ({ page, mockApi }) => {
    // Mock available slug check
    await mockApi('/queue/slug-check?slug=new-slug', { isAvailable: true })

    // Mock successful creation
    const createdQueue = {
      id: 'q-999',
      name: 'First Queue',
      slug: 'new-slug',
      joinCode: 'ABC-123',
      status: 'ACTIVE',
    }
    await mockApi('/queue/p/create', createdQueue)
    // Fill form
    await page.getByLabel('Queue Name').fill('First Queue')

    // Fill slug
    const slugInput = page.getByLabel('Queue Link (Optional)')
    await slugInput.fill('new-slug')

    // Wait for API check
    await page.waitForResponse(
      (response) =>
        response.url().includes('/queue/slug-check') && response.request().method() === 'GET',
    )

    // Mock live queue to return createdQueue when LiveQueueView mounts after creation
    await mockApi('/queue/live', createdQueue)

    // Create
    await page.getByRole('button', { name: /create queue/i }).click()

    // Wait for success modal and click 'CLOSE'
    await expect(page.getByText('Queue is open!')).toBeVisible()
    await page.getByRole('button', { name: 'CLOSE' }).click()

    // Should stay on dashboard queue (now in live mode)
    await expect(page).toHaveURL(/\/dashboard\/queue/)
  })
})
