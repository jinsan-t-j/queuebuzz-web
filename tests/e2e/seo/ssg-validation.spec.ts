import seo from '../../../src/config/seo.constants.json' with { type: 'json' }
import { test, expect } from '../fixtures/base.fixture'

/**
 * @file ssg-validation.spec.ts
 * @description Validates SSG pre-rendering and SEO metadata injection.
 * Ensures that Home and Support pages serve correct HTML even with JS disabled,
 * and that the Dashboard remains a functional Client-Side SPA.
 */

test.describe('SSG & SEO Validation', () => {
  // Test Home Page SEO (JS Disabled)
  test('Home page should have correct SEO tags with JS disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto('/')

    // Validate Title
    await expect(page).toHaveTitle(seo['/'].title)

    // Validate Meta Description
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBe(seo['/'].description)

    // Validate OG Tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBe(seo['/'].title)

    // Validate UI Content (Raw HTML)
    const heroHeading = page.getByRole('heading', { name: /Replace physical lines/i })
    await expect(heroHeading).toBeVisible()

    await context.close()
  })

  // Test Support Page SEO (JS Disabled)
  test('Support page should have correct SEO tags with JS disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto('/support/')

    // Validate Title
    await expect(page).toHaveTitle(seo['/support'].title)

    // Validate Meta Description
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBe(seo['/support'].description)

    // Validate OG Tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBe(seo['/support'].title)

    // Validate UI Content (Raw HTML)
    const contactHeading = page.getByText('How can we help?')
    await expect(contactHeading).toBeVisible()

    await context.close()
  })

  // Test SPA Hydration (JS Enabled)
  test('Login page should correctly load and hydrate as a dynamic SPA', async ({ page }) => {
    // Go to login (which is now pre-rendered)
    await page.goto('/login-or-signup/')

    // Verify Title
    await expect(page).toHaveTitle(seo['/login-or-signup'].title, { timeout: 10000 })

    const loginTitle = page.getByRole('heading', { name: 'Log in or sign up' })
    await expect(loginTitle).toBeVisible()

    // Verify hydration: Interactive elements should work
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })
})
