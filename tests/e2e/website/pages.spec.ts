import { test, expect } from '../fixtures/base.fixture'

/**
 * @spec Website Pages
 * @description E2E tests for public-facing website pages.
 * Routes: /, /pricing, /privacy, /terms, /support
 */

test.describe('Website — Home', () => {
  test('should render landing page with hero and CTA', async ({ page }) => {
    await page.goto('/')

    // Brand in nav
    await expect(page.getByRole('navigation').getByText('QueueBuzz').first()).toBeVisible()

    // Primary heading (LCP element)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 })
  })

  test('should have navigation links', async ({ page }) => {
    await page.goto('/')

    // Pricing link in nav
    if (await page.locator('button[aria-label*="menu"], button:has(.lucide-menu)').isVisible()) {
      await page.locator('button[aria-label*="menu"], button:has(.lucide-menu)').click()
    }
    await expect(
      page.getByRole('link', { name: 'Pricing' }).filter({ visible: true }).first(),
    ).toBeVisible()
  })
})

test.describe('Website — Pricing', () => {
  test('should render pricing page with plan cards', async ({ page }) => {
    await page.goto('/pricing')

    // Page heading
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 })

    // Plan tier text - wait for loading to finish
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 })
    await expect(
      page
        .getByText(/Free|Starter|Premium|Pro|Elite/i)
        .filter({ visible: true })
        .first(),
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Website — Go Premium', () => {
  test('should render premium page with premium plan cards', async ({ page }) => {
    await page.goto('/premium')

    // Page heading
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 })

    // Plan tier text
    await expect(page.getByText(/Premium|Pro/i).first()).toBeVisible()
  })
})

test.describe('Website — Legal', () => {
  test('should render privacy policy page', async ({ page }) => {
    await page.goto('/privacy')

    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 })
  })

  test('should render terms of service page', async ({ page }) => {
    await page.goto('/terms')

    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Website — Support', () => {
  test('should render support page', async ({ page }) => {
    await page.goto('/support')

    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 })
  })
})
