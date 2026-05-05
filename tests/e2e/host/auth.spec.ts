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
    await expect(page.getByRole('button', { name: 'Continue with Apple' })).toBeVisible()

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
})
