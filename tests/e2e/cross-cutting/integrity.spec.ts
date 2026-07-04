import AxeBuilder from '@axe-core/playwright'

import { expect, test } from '../fixtures/base.fixture'
import { makeActiveQueueDashboard, makeHostProfile } from '../fixtures/mocks/host.mock'

/**
 * @spec UI Integrity and Robustness
 * @description Validates layout integrity, overflow, touch targets, and visual consistency.
 */

test.describe('UI Integrity Audit', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi('/host/me', makeHostProfile())
    await mockApi('/queue/dashboard', makeActiveQueueDashboard())
  })

  test('Horizontal Overflow Detection', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const overflow = await page.evaluate(() => {
      const elementsWithOverflow = []
      const docWidth = document.documentElement.clientWidth

      // Check document body and all top-level children
      if (document.body.scrollWidth > docWidth + 2) {
        elementsWithOverflow.push(`body (scroll:${document.body.scrollWidth} client:${docWidth})`)
      }

      // Check for elements that might be causing it
      const allElements = Array.from(document.querySelectorAll('*'))
      for (const el of allElements) {
        const scrollWidth = el.scrollWidth
        const clientWidth = el.clientWidth
        if (
          scrollWidth > clientWidth + 2 &&
          getComputedStyle(el).overflowX !== 'auto' &&
          getComputedStyle(el).overflowX !== 'scroll'
        ) {
          // Only report if it's actually wider than the viewport
          const rect = el.getBoundingClientRect()
          if (rect.right > docWidth || rect.left < 0) {
            elementsWithOverflow.push(
              `${el.tagName}.${el.className.split(' ').join('.')} (scroll:${scrollWidth} client:${clientWidth})`,
            )
          }
        }
      }
      return elementsWithOverflow
    })

    expect(overflow, `Found elements with horizontal overflow: ${overflow.join(', ')}`).toEqual([])
  })

  test('Touch Target Auditing', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Run axe with specifically touch-target rules
    const results = await new AxeBuilder({ page })
      .include('button')
      .include('a')
      .withRules(['target-size'])
      .analyze()

    expect(
      results.violations,
      'Touch targets must be at least 44x44px or have sufficient spacing',
    ).toEqual([])
  })

  test('Viewport Visibility Assertions', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Wait for the greeting or onboarding title to be populated
    const mainHeading = page.locator('h1, h2').first()
    await expect(mainHeading).not.toHaveText(/Loading/i)

    // Critical UI components must be in viewport on load
    const greeting = page
      .locator('h1, h2', { hasText: /(Good (morning|afternoon|evening)|Welcome to QueueBuzz)/i })
      .first()
    const statsCard = page.locator('div:has-text("Served Today")').first()
    const manageBtn = page.getByRole('link', { name: /Manage Live|Start Session/i })

    await greeting.scrollIntoViewIfNeeded()
    await expect(greeting).toBeInViewport()

    await statsCard.scrollIntoViewIfNeeded()
    await expect(statsCard).toBeInViewport()

    await expect(manageBtn).toBeVisible()
  })

  test('Visual Regression Testing', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Mask dynamic content like timestamps, user initials, greeting, and date
    await expect(page).toHaveScreenshot('dashboard-main.png', {
      mask: [
        page.locator('.font-mono'), // Masking counters/times
        page.locator('h1, h2').first(), // Masking Greeting (Good morning/afternoon)
        page.locator(String.raw`p.font-body.text-\[10px\]`).first(), // Masking Date string
      ],
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('QR Code Capture Template Visual Integrity', async ({ page, mockApi }) => {
    await mockApi('/queue/dashboard', makeActiveQueueDashboard())
    await mockApi('/queue/live', {
      data: {
        id: 'q-123',
        public_id: 'p-q-123',
        name: 'Morning Consultation',
        status: 'active',
        waiting: 3,
        is_active: true,
        joinCode: 'CLNC01',
        startedAt: new Date().toISOString(),
      },
    })
    await mockApi('/queue/manage/q-123/live', { data: [] })

    await page.goto('/dashboard/queue')
    await page.waitForLoadState('networkidle')

    // Open the QR Modal
    await page.getByRole('button', { name: 'Show QR' }).click()
    await expect(page.locator('#capture-host-qr')).toBeAttached()

    // Temporarily make the hidden template visible in the viewport so it renders/screenshots correctly
    await page.evaluate(() => {
      const container = document.querySelector('#capture-host-qr')?.parentElement
      if (container) {
        container.setAttribute(
          'style',
          'position: fixed; left: 20px; top: 20px; z-index: 99999; background: white;',
        )
      }
    })

    // Take screenshot and assert visual integrity
    await expect(page.locator('#capture-host-qr')).toHaveScreenshot('host-qr-capture.png', {
      mask: [
        page.locator('#capture-host-qr img'), // Mask the dynamic QR code image itself since it contains dynamic URL
      ],
      maxDiffPixelRatio: 0.05,
    })
  })

  test('Z-Index Collision Check', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const mainHeading = page.locator('h1, h2').first()
    await expect(mainHeading).not.toHaveText(/Loading/i)
    const manageBtn = page.getByRole('link', { name: /Manage Live|Start Session/i }).first()

    // Ensure it's in view before testing actionability
    await manageBtn.scrollIntoViewIfNeeded()

    // Attempt to click it - Playwright's click() automatically checks for actionability/interception
    await manageBtn.click({ trial: true })

    // Check if any overlays are blocking the view
    const isIntersecting = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]')
      const popover = document.querySelector('[role="complementary"]')
      return !!(modal || popover)
    })

    if (!isIntersecting) {
      await expect(manageBtn).toBeEnabled()
    }
  })

  test('Font and Icon Scaling', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox calculates SVG parent dimensions differently')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Check that icons don't exceed their containers
    const icons = await page.locator('svg').all()
    for (const icon of icons) {
      const isBlownOut = await icon.evaluate((node) => {
        const parent = node.parentElement
        if (!parent) return false
        return node.clientWidth > parent.clientWidth || node.clientHeight > parent.clientHeight
      })
      expect(isBlownOut, 'Icon should not blow out its container').toBeFalsy()
    }

    // Check for text overlapping (approximate check by looking for height mismatches)
    const textElements = await page.locator('p, span, h1, h2, h3').all()
    for (const el of textElements) {
      const isOverlapping = await el.evaluate((node) => {
        const style = globalThis.getComputedStyle(node)
        if (style.overflow === 'hidden') return false
        return node.scrollHeight > node.clientHeight + 2 // 2px margin for rounding
      })
      expect(isOverlapping, 'Text should not be overlapping or clipped').toBeFalsy()
    }
  })

  test('Image Aspect Ratio Integrity', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const images = await page.locator('img').all()
    for (const img of images) {
      const isNatural = await img.evaluate((node: HTMLImageElement) => {
        if (!node.complete || node.naturalWidth === 0) return true // skip unloaded/SVG icons
        const ratio = node.naturalWidth / node.naturalHeight
        const renderedRatio = node.clientWidth / node.clientHeight
        // Allow 5% tolerance for rounding
        return Math.abs(ratio - renderedRatio) < 0.05
      })
      expect(
        isNatural,
        `Image ${await img.getAttribute('src')} has distorted aspect ratio`,
      ).toBeTruthy()
    }
  })
})
