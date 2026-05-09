import seo from '../../src/config/seo.constants.json' with { type: 'json' }

import { test, expect } from './fixtures/base.fixture'

/**
 * @spec SSG and SEO Integrity
 * @description Validates that critical landing pages are pre-rendered and SEO-friendly
 * even when JavaScript is disabled, while authenticated routes hydrate as SPAs.
 */

test.describe('SSG Integrity (JS Disabled)', () => {
  test.use({ javaScriptEnabled: false })

  test('Home page should have SEO metadata and hero content in static HTML', async ({ page }) => {
    await page.goto('/')

    // SEO Metadata
    await expect(page).toHaveTitle(seo['/'].title)
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', seo['/'].description)

    // Primary Content (should exist without JS)
    const h1 = page.locator('h1')
    await expect(h1).toContainText(/ZERO LINES/i)
    await expect(h1).toContainText(/BETTER BUSINESS/i)

    // CTA should be present
    const cta = page.getByRole('link', { name: /Start for Free|Get Started/i }).first()
    await expect(cta).toBeVisible()
  })

  test('Support page should have pre-rendered help content', async ({ page }) => {
    await page.goto('/support/')

    await expect(page).toHaveTitle(seo['/support'].title)
    const h1 = page.locator('h1')
    await expect(h1).toContainText(/How can we help/i)

    // Check for some static text in the support module
    await expect(page.locator('body')).toContainText(/CONTACT & SUPPORT/i)
  })

  test('Dashboard should fallback to index (Home) when JS is disabled', async ({ page }) => {
    await page.goto('/dashboard')

    // It should NOT show dashboard-specific headings
    const greeting = page.locator('h2:has-text("morning"), h2:has-text("afternoon")')
    await expect(greeting).not.toBeVisible()

    // It will show the Home page pre-rendered content (fallback behavior)
    const homeH1 = page.locator('h1')
    await expect(homeH1).toContainText(/ZERO LINES/i)
  })
})

test.describe('SPA Hydration (JS Enabled)', () => {
  test('Dashboard correctly hydrates and renders dynamic content', async ({ page, mockApi }) => {
    // Mock auth for dashboard access
    await page.addInitScript(() => {
      // Inject Pinia state directly for immediate hydration
      const authState = {
        user: {
          id: 'host-1',
          publicId: 'host-pub-1',
          name: 'Test Host',
          email: 'host@queuebuzz.com',
          tier: 'free',
          avatar: null,
        },
        activeGuestQueueId: null,
        isHydrated: true,
      }
      globalThis.localStorage.setItem('auth', JSON.stringify(authState))
      // Legacy support if some components still use these
      globalThis.localStorage.setItem('auth_token', 'stub-token')
      globalThis.localStorage.setItem('user_role', 'host')
    })

    // Mock auth profile API (fallback for hydration check)
    await mockApi('/host/me', {
      id: 'host-1',
      public_id: 'host-pub-1',
      name: 'Test Host',
      email: 'host@queuebuzz.com',
      tier: 'free',
      avatar: null,
    })

    // Mock refresh token to prevent auth loops on failure
    await mockApi('/auth/refresh/token', { message: 'No refresh token' }, 401)

    // Mock dashboard API to ensure it finishes loading
    await mockApi('/queue/dashboard', {
      greeting: { name: 'Test Host' },
      stats: { servedToday: 0, avgWait: '0m', peakWait: 0, skipped: 0 },
      activeQueue: { isActive: false, queueName: '', startedAt: '', waiting: 0 },
      weekChart: [],
      recentSessions: [],
      returnRate: { hasData: false, returningCount: 0, chartData: [], byQueue: [] },
      droppedSkipped: [],
      peakHours: [],
      quickSetup: { show: true, steps: [] },
      hasHistory: false,
    })

    await page.goto('/dashboard')

    // Should eventually hydrate and show the dashboard
    // We wait for the "Welcome" hero (since hasHistory is false by default in our mock)
    await expect(page.getByRole('heading', { name: /Welcome to QueueBuzz/i }).first()).toBeVisible({
      timeout: 20000,
    })

    // Check for dynamic element that requires Vue logic (e.g. the user menu dropdown trigger)
    const userMenu = page.locator('button[aria-haspopup="true"]').first()
    await expect(userMenu).toBeVisible({ timeout: 10000 })
  })
})
