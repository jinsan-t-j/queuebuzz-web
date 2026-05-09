import { test, expect } from '@playwright/test'

import seo from '../../../src/config/seo.constants.json' with { type: 'json' }

test.describe('SSG & SEO Validation (No JS)', () => {
  test.use({ javaScriptEnabled: false })

  test('Home page has SEO metadata and primary content in raw HTML', async ({ page }) => {
    await page.goto('/')

    // Validate Title & Meta
    await expect(page).toHaveTitle(seo['/'].title)
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', seo['/'].description)

    // Validate Primary UI Content (Static)
    const h1 = page.locator('h1')
    await expect(h1).toContainText('ZERO LINES.')

    // Target hero section buttons specifically to avoid footer duplicates
    await expect(
      page.getByRole('link', { name: /Start for Free|Get Started/i }).first(),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: /Join a Queue/i }).first()).toBeVisible()
  })

  test('Support page has SEO metadata and primary content in raw HTML', async ({ page }) => {
    await page.goto('/support/')

    // Validate Title
    await expect(page).toHaveTitle(seo['/support'].title)

    // Validate Primary UI Content (Static)
    const h1 = page.locator('h1')
    await expect(h1).toContainText('How can we help?')
    await expect(page.getByText('CONTACT & SUPPORT')).toBeVisible()
    await expect(page.getByText('Send a Message')).toBeVisible()
  })
})

test.describe('SPA Hydration & Dynamic Layer', () => {
  test('Dashboard correctly loads and hydrates as a dynamic SPA', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for the app to hydrate and the auth guard to redirect
    // Since /login-or-signup is now SSG'd, it should eventually show the correct title
    await expect(page).toHaveURL(/\/login-or-signup/, { timeout: 20000 })

    // Verify "Sign In" page content exists
    await expect(page.locator('h1')).toContainText('Log in or sign up')

    // Check if dynamic elements are interactive (confirming hydration)
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    await emailInput.fill('test@queuebuzz.com')
    await expect(emailInput).toHaveValue('test@queuebuzz.com')
  })
})
