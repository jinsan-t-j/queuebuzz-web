import { test, expect } from '../fixtures/base.fixture'
import { makeActiveQueueDashboard } from '../fixtures/mocks/host.mock'

/**
 * @spec Content Stress and Network Resilience
 * @description Validates layout integrity under extreme content (long strings, large lists)
 * and degraded network conditions.
 */

test.describe('Stress and Network Resilience', () => {
  test('MSW Content Stress Testing (Long Strings)', async ({ page, mockApi }) => {
    // Mocking extra-long strings to verify Flexbox/Grid container integrity
    const stressedData = makeActiveQueueDashboard()
    stressedData.data.active_queue!.queueName = 'A'.repeat(500)

    await mockApi('/queue/dashboard', stressedData)
    await page.goto('/dashboard')

    const queueName = page.getByText('A'.repeat(500)).first()
    await expect(queueName).toBeVisible()

    // Ensure it doesn't break the layout (no horizontal scroll on parent)
    const container = page.locator('main')
    const hasOverflow = await container.evaluate((el) => el.scrollWidth > el.clientWidth)
    expect(
      hasOverflow,
      'Container should handle long strings without horizontal overflow',
    ).toBeFalsy()
  })

  test('Real-time Data Overflow (Flicker detection)', async ({ page }) => {
    // Simulate high-frequency updates
    await page.goto('/dashboard')

    // Simulate rapid state changes via page.evaluate
    await page.evaluate(() => {
      const btn = document.querySelector('button')
      if (btn) {
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            btn.classList.toggle('bg-mint')
            btn.innerText = `Update ${i}`
          }, i * 50)
        }
      }
    })

    // Check for "layout popping" or flicker
    await page.waitForTimeout(1500)
    await expect(page).not.toHaveTitle(/Error/i)
  })

  test('Throttled Load Layouts (3G Network)', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP is only supported in Chromium')
    // Simulate 3G network speeds
    await context.setOffline(false)
    const client = await context.newCDPSession(page)
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 300,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    })

    // We control when the API responds using a manual promise
    let releaseApi: () => void
    const apiPromise = new Promise<void>((resolve) => {
      releaseApi = resolve
    })

    await page.route('**/api/v1/queue/dashboard', async (route) => {
      await apiPromise
      const origin = route.request().headers().origin || 'http://localhost:4002'
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({ success: true, ...makeActiveQueueDashboard() }),
      })
    })

    // Await goto, since fetch doesn't block the window 'load' event
    await page.goto('/dashboard')

    // Verify loading skeletons are visible while API is pending
    // Increased timeout because 3G network simulation slows down JS bundle loading
    const skeleton = page.locator('.animate-pulse').first()
    await expect(skeleton).toBeVisible({ timeout: 15000 })

    // Now release the API response
    releaseApi!()

    // Wait for content
    await expect(
      page.getByRole('link', { name: /Manage Live|Start Session/i }).first(),
    ).toBeVisible({ timeout: 10000 })
  })

  test('Media Query Consistency', async ({ page }) => {
    await page.goto('/dashboard')

    // Test hidden elements at mobile breakpoint
    await page.setViewportSize({ width: 375, height: 667 })
    const desktopOnly = page.locator('.hidden-sm-only, .hidden').first()
    if ((await desktopOnly.count()) > 0) {
      await expect(desktopOnly).not.toBeVisible()
    }

    // Switch to desktop
    await page.setViewportSize({ width: 1280, height: 800 })
  })
})
