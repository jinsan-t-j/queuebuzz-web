import { test, expect } from '../fixtures/base.fixture'
import { makeBillingPlansWithEliteTrial, makeTrialOfferResponse } from '../fixtures/mocks/host.mock'

/**
 * @spec Website Pages
 * @description E2E tests for public-facing website pages.
 * Routes: /, /pricing, /privacy, /terms, /support
 */

test.describe('Website — Home', () => {
  test('should render landing page with hero and CTA', async ({ page }) => {
    await page.goto('/')

    // Brand wordmark in nav (logo SVG renders Q, then "ueue" + "Buzz" text)
    await expect(page.getByRole('navigation').getByText('ueue').first()).toBeVisible()

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

test.describe('Website — Pricing — Business Elite Trial', () => {
  // NOTE: mockApi registrations are checked in *registration order* by the
  // shared route interceptor, and "/billing/plans/trial-offer" contains
  // "/billing/plans" as a substring — so the more specific route must always
  // be registered first, or it'll never be reached.

  test('shows the normal CTA when no trial param is present', async ({ page, mockApi }) => {
    await mockApi('/billing/plans', { plans: makeBillingPlansWithEliteTrial() })
    await page.goto('/pricing')

    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 })
    // Only the Business Elite plan is paid in this mock, so "Choose Plan" is unambiguous.
    await expect(page.getByRole('button', { name: 'Choose Plan' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Free Trial/i })).toHaveCount(0)
  })

  test('shows the "Try 3-Day Free Trial" CTA alongside the normal CTA when a valid trial token resolves', async ({
    page,
    mockApi,
  }) => {
    await mockApi('/billing/plans/trial-offer', makeTrialOfferResponse())
    await mockApi('/billing/plans', { plans: makeBillingPlansWithEliteTrial() })
    await page.goto('/pricing?trial=valid-secret-token')

    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Try 3-Day Free Trial' })).toBeVisible({
      timeout: 10000,
    })
    // The trial CTA is additive — the normal purchase path stays available.
    await expect(page.getByRole('button', { name: 'Choose Plan' })).toBeVisible()
  })

  test('falls back to the normal CTA when the token does not resolve (invalid/unsupported)', async ({
    page,
    mockApi,
  }) => {
    await mockApi('/billing/plans/trial-offer', { message: 'Trial offer not found' }, 404)
    await mockApi('/billing/plans', { plans: makeBillingPlansWithEliteTrial() })
    await page.goto('/pricing?trial=guessed-wrong-token')

    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 })
    await expect(page.getByRole('button', { name: /Free Trial/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Choose Plan' })).toBeVisible()
  })

  test('falls back to the normal CTA when the trial query param is missing entirely', async ({
    page,
    mockApi,
  }) => {
    await mockApi('/billing/plans', { plans: makeBillingPlansWithEliteTrial() })
    await page.goto('/pricing')

    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 })
    await expect(page.getByRole('button', { name: /Free Trial/i })).toHaveCount(0)
  })

  test('clicking the trial CTA requests checkout with isTrial set', async ({ page, mockApi }) => {
    await mockApi('/billing/plans/trial-offer', makeTrialOfferResponse())
    await mockApi('/billing/plans', { plans: makeBillingPlansWithEliteTrial() })
    // Fulfilled via mockApi (not a raw context.route) so CORS preflight is
    // handled the same way as every other mocked endpoint — a hand-rolled
    // route here previously skipped OPTIONS handling and broke under WebKit's
    // stricter CORS enforcement.
    await mockApi('/billing/checkout', { url: 'https://dodopayments.com/checkout/mock' })

    let checkoutBody: Record<string, unknown> | null = null
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/billing/checkout')) {
        checkoutBody = req.postDataJSON()
      }
    })

    await page.goto('/pricing?trial=valid-secret-token')
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 })
    await page.getByRole('button', { name: 'Try 3-Day Free Trial' }).click()

    await expect.poll(() => checkoutBody).not.toBeNull()
    expect(checkoutBody).toMatchObject({ plan_id: 'plan-elite', is_trial: true })
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
