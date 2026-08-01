import { test, expect } from '../fixtures/base.fixture'

/**
 * @spec Host Authentication
 * @description E2E tests for login page visibility, form structure, and validation.
 * Route: /login-or-signup
 *
 * NOTE: Toast/success tests for auth submission are skipped because the auth flow
 * uses Firebase client SDK which isn't interceptable via page.route. Those flows
 * should be tested via integration tests with Firebase emulator.
 */

test.describe('Authentication', () => {
  test('should render login page with email form and social buttons', async ({ page }) => {
    await page.goto('/login-or-signup')

    // Heading
    await expect(page.getByRole('heading', { name: 'Log in or sign up' })).toBeVisible()

    // Email input
    await expect(page.locator('input[type="email"]')).toBeVisible()

    // Continue button (exact match avoids "Continue with Google")
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible()

    // Social login buttons
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()

    // Legal footer links
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible()
  })

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/login-or-signup')

    // Submit without email
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(page.getByText('Email is required')).toBeVisible()

    // Submit with invalid email
    await page.locator('input[type="email"]').fill('not-an-email')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(page.getByText('Invalid email address')).toBeVisible()
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/login-or-signup')

    await expect(page).toHaveTitle(/Log in|Sign up|QueueBuzz/i)
  })

  test('should have logo linking to home', async ({ page }) => {
    await page.goto('/login-or-signup')

    // Logo link to home
    const logoLink = page.locator('a[href="/"]').first()
    await expect(logoLink).toBeVisible()
    await expect(logoLink).toContainText('QueueBuzz')
  })

  test('should show, dismiss, and restore queue claim context from query parameter', async ({
    page,
    mockApi,
  }) => {
    // Mock the queue details for the claim_queue_id param
    await mockApi('/queue/p/claim-123/live', {
      id: 'claim-123',
      name: 'Chai Point Mumbai',
    })

    // Navigate to login with claim_queue_id query param
    await page.goto('/login-or-signup?claim_queue_id=claim-123')

    // 1. Verify Claim Context Chip is visible
    const chip = page.getByText('Claiming Chai Point Mumbai — log in to continue')
    await expect(chip).toBeVisible()

    // 2. Click dismiss button on the chip
    const dismissBtn = page.getByRole('button', { name: 'Dismiss claim' })
    await expect(dismissBtn).toBeVisible()
    await dismissBtn.click()

    // 3. Verify Chip is removed and claim_queue_id query param is removed from URL
    await expect(chip).not.toBeVisible()
    await expect(page).toHaveURL(/^(?!.*claim_queue_id=).*$/)

    // 4. Verify "Restore Claim" prompt is visible
    const restorePrompt = page.getByText('Not claiming "Chai Point Mumbai" anymore?')
    await expect(restorePrompt).toBeVisible()

    const restoreBtn = page.getByRole('button', { name: 'Add queue claim back' })
    await expect(restoreBtn).toBeVisible()

    // 5. Click "Restore Claim" button
    await restoreBtn.click()
    await page.waitForTimeout(100)

    // 6. Verify URL has the query param again and Chip is restored
    await expect(page).toHaveURL(/claim_queue_id=claim-123/)
    await expect(chip).toBeVisible({ timeout: 10000 })
    await expect(restorePrompt).not.toBeVisible()
  })
})
