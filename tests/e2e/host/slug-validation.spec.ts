import { expect, test } from '@playwright/test'

test.describe('Slug Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as host
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@queuebuzz.app')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should validate slug format correctly', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('text=Open New Queue')
    await expect(page).toHaveURL('/queue/new')

    const slugInput = page.locator('#slug')

    // Too short
    await slugInput.fill('ab')
    await page.waitForTimeout(600) // wait for debounce
    await expect(
      page.locator('text=Must be 3-30 lowercase alphanumeric characters or hyphens'),
    ).toBeVisible()

    // Invalid characters
    await slugInput.fill('invalid_slug')
    await page.waitForTimeout(600)
    await expect(
      page.locator('text=Must be 3-30 lowercase alphanumeric characters or hyphens'),
    ).toBeVisible()

    // Starts with hyphen
    await slugInput.fill('-invalid')
    await page.waitForTimeout(600)
    await expect(
      page.locator('text=Must be 3-30 lowercase alphanumeric characters or hyphens'),
    ).toBeVisible()

    // Ends with hyphen
    await slugInput.fill('invalid-')
    await page.waitForTimeout(600)
    await expect(
      page.locator('text=Must be 3-30 lowercase alphanumeric characters or hyphens'),
    ).toBeVisible()

    // Valid format
    await slugInput.fill('valid-slug-123')
    await page.waitForTimeout(600)
    await expect(
      page.locator('text=Must be 3-30 lowercase alphanumeric characters or hyphens'),
    ).not.toBeVisible()
  })

  test('should handle reserved slugs', async ({ page }) => {
    await page.goto('/queue/new')
    const slugInput = page.locator('#slug')

    await slugInput.fill('admin')
    await page.waitForTimeout(600)
    await expect(page.locator('text=This link is already taken')).toBeVisible()

    await slugInput.fill('settings')
    await page.waitForTimeout(600)
    await expect(page.locator('text=This link is already taken')).toBeVisible()
  })

  test('should show error when slug is already taken', async ({ page }) => {
    // Create a queue with a slug first
    const takenSlug = `taken-${Date.now()}`
    await page.goto('/queue/new')
    await page.fill('#queueName', 'First Queue')
    await page.fill('#slug', takenSlug)
    await page.click('text=Open Queue')
    await expect(page).toHaveURL(/\/dashboard\/queue\/.*/)

    // Try to create another queue with the same slug
    await page.goto('/queue/new')
    const slugInput = page.locator('#slug')
    await slugInput.fill(takenSlug)
    await page.waitForTimeout(600)
    await expect(page.locator('text=This link is already taken')).toBeVisible()
  })
})
