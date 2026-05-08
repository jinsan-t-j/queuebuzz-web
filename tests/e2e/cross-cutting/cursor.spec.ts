import { expect, test } from '../fixtures/base.fixture'

/**
 * @spec Cursor Audit
 * @description Ensures all interactive elements (a, button, role=button, and click-listeners)
 * have cursor: pointer applied.
 */

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Support', path: '/support' },
  { name: 'Login', path: '/login-or-signup' },
  { name: 'Dashboard', path: '/dashboard', auth: true },
] as const

test.describe('UI Cursor Audit', () => {
  for (const pageInfo of PAGES) {
    test(`Check interactive cursors on ${pageInfo.name}`, async ({ page }) => {
      await page.goto(pageInfo.path)
      await page.waitForLoadState('networkidle')

      // Identify all potentially interactive elements
      // 1. Standard tags: a, button, input[type=submit]
      // 2. ARIA roles: role="button", role="link", role="menuitem"
      // 3. Custom: elements with .cursor-pointer (Tailwind standard)
      const selectors = [
        'a[href]',
        'button:not(:disabled)',
        '[role="button"]:not([aria-disabled="true"])',
        '[role="link"]',
        '.cursor-pointer',
      ]

      const interactiveElements = page.locator(selectors.join(', '))
      const count = await interactiveElements.count()

      for (let i = 0; i < count; i++) {
        const el = interactiveElements.nth(i)

        // Skip hidden elements
        if (!(await el.isVisible())) continue

        const cursor = await el.evaluate((node) => globalThis.getComputedStyle(node).cursor)
        const html = await el.evaluate((node) => node.outerHTML.substring(0, 100))

        expect(cursor, `Element should have cursor:pointer:\n${html}`).toBe('pointer')
      }
    })
  }
})
