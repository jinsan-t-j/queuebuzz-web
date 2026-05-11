import { test, expect } from '../fixtures/base.fixture'
import { makeDashboardResponse } from '../fixtures/mocks/host.mock'

test.describe('Slug Validation', () => {
  test.beforeEach(async ({ mockApi }) => {
    // Already "logged in" via fixture addInitScript
    // Mock the dashboard to avoid any issues with the landing state
    await mockApi('/queue/dashboard', makeDashboardResponse({ hasHistory: true }))
  })

  test('should validate slug format correctly', async ({ page }) => {
    // Go directly to the create queue page
    await page.goto('/dashboard/queue')
    await page.waitForLoadState('networkidle')

    const slugInput = page.locator('input#slug').first()

    // Too short
    await slugInput.fill('ab')
    await page.waitForTimeout(1000) // wait for debounce
    await expect(
      page.locator('text=Must be 3-30 lowercase alphanumeric characters or hyphens').first(),
    ).toBeVisible()

    // Invalid characters
    await slugInput.fill('invalid_slug')
    await page.waitForTimeout(1000)
    await expect(
      page.locator('text=Must be 3-30 lowercase alphanumeric characters or hyphens').first(),
    ).toBeVisible()

    // Valid
    await slugInput.fill('valid-slug-123')
    await page.waitForTimeout(1000)
    await expect(
      page.locator('text=Must be 3-30 lowercase alphanumeric characters or hyphens'),
    ).not.toBeVisible()
  })

  test('should show error when slug is already taken', async ({ page, mockApi }) => {
    const takenSlug = 'taken-slug'

    // Mock the availability check
    await mockApi(`/queue/slug-check?slug=${takenSlug}`, { available: false })

    await page.goto('/dashboard/queue')
    await page.waitForLoadState('networkidle')
    const slugInput = page.locator('input#slug').first()

    // Trigger the check
    await slugInput.fill(takenSlug)

    // Wait for the API response
    await page.waitForResponse(
      (resp) => resp.url().includes('slug-check') && resp.url().includes(takenSlug),
    )

    await expect(page.locator('text=This link is already taken').first()).toBeVisible()
  })

  test('should allow creating queue with valid custom slug', async ({ page, mockApi }) => {
    const customSlug = 'my-awesome-queue'
    await mockApi(`/queue/slug-check?slug=${customSlug}`, { available: true })
    await mockApi('/queue', {
      id: 'q-999',
      name: 'First Queue',
      slug: customSlug,
      joinCode: 'ABC123',
    })

    await page.goto('/dashboard/queue')
    await page.waitForLoadState('networkidle')

    await page.locator('input#queueName').first().fill('First Queue')
    await page.locator('input#slug').first().fill(customSlug)

    // Wait for slug check to finish
    await page.waitForTimeout(1000)

    await page.click('text=Open Queue')

    // Check if we reached the live dashboard
    await expect(page.locator('text=First Queue').first()).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Join Code').first()).toBeVisible()
  })
})
